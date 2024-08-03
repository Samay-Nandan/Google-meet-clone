import {
  useState,
  useEffect,
  useRef,
  useCallback,
  RefObject,
  createRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { faker } from "@faker-js/faker";

interface PeerData {
  peer: RTCPeerConnection;
  userId: string;
}

interface RTCSignal {
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface SignalData {
  signal: RTCSignal;
  userId: string;
}

export const useSocket = () => {
  const [peers, setPeers] = useState<PeerData[]>([]);
  const [remoteVideoRefs, setRemoteVideoRefs] = useState<
    Record<string, RefObject<HTMLVideoElement>>
  >({});
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>("");
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializeUserId();
    connectSocket();

    return () => disconnectSocket();
  }, []);

  const initializeUserId = () => {
    if (!userIdRef.current) {
      const storedUserId = sessionStorage.getItem("userId");
      if (storedUserId) {
        userIdRef.current = storedUserId;
      } else {
        userIdRef.current = faker.string.uuid();
        sessionStorage.setItem("userId", userIdRef.current);
      }
    }
  };

  const connectSocket = () => {
    socketRef.current = io({ path: "/api/socket" });

    socketRef.current.on("connect", () => {
      socketRef.current?.on("user-connected", handleUserConnected);
      socketRef.current?.on("signal", handleSignal);
      socketRef.current?.on("disconnect", handleDisconnect);
      startCall();
    });
  };

  const disconnectSocket = () => {
    socketRef.current?.disconnect();
    peers.forEach((peerData) => {
      peerData.peer.getSenders().forEach((sender) => {
        peerData.peer.removeTrack(sender);
      });
      peerData.peer.close();
    });
    setPeers([]);
    setRemoteVideoRefs({});
  };

  const createPeer = (userId: string, initiator: boolean) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => {
          peer.addTrack(track, localVideoRef.current?.srcObject as MediaStream);
        });
    }

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("signal", {
          userId,
          signal: { candidate: event.candidate },
        });
      }
    };

    peer.ontrack = (event) => {
      const videoRef = remoteVideoRefs[userId];
      if (videoRef?.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    if (initiator) {
      peer.createOffer().then((offer) => {
        peer.setLocalDescription(offer);
        socketRef.current?.emit("signal", { userId, signal: { sdp: offer } });
      });
    }

    return peer;
  };

  const handleUserConnected = useCallback(
    ({ userId, socketId }: { userId: string; socketId: string }) => {
      const isInitiator = socketRef.current?.id === socketId;
      const peer = createPeer(socketId, isInitiator);

      setPeers((prevPeers) => [...prevPeers, { peer, userId }]);
      setRemoteVideoRefs((prevRefs) => ({
        ...prevRefs,
        [userId]: createRef<HTMLVideoElement>(),
      }));
    },
    [remoteVideoRefs]
  );

  const handleSignal = useCallback(
    async ({ signal, userId }: SignalData) => {
      const peerData = peers.find((p) => p.userId === userId);
      if (peerData) {
        try {
          if (signal.sdp) {
            await peerData.peer.setRemoteDescription(
              new RTCSessionDescription(signal.sdp)
            );
            if (signal.sdp.type === "offer") {
              const answer = await peerData.peer.createAnswer();
              await peerData.peer.setLocalDescription(answer);
              socketRef.current?.emit("signal", {
                userId,
                signal: { sdp: answer },
              });
            }
          } else if (signal.candidate) {
            await peerData.peer.addIceCandidate(
              new RTCIceCandidate(signal.candidate)
            );
          }
        } catch (error) {
          console.error("Error handling signal: ", error);
        }
      }
    },
    [peers]
  );

  const handleDisconnect = () => disconnectSocket();

  const startCall = () => {
    const roomId =
      typeof window !== "undefined" &&
      window.location.pathname.split("/").pop();
    socketRef.current?.emit("join-room", roomId, userIdRef.current);
  };

  return { peers, remoteVideoRefs, socketRef, localVideoRef };
};

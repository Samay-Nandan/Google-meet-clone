import {
  useState,
  useEffect,
  useRef,
  useCallback,
  RefObject,
  createRef,
} from "react";
import { io, Socket } from "socket.io-client";
import SimplePeer from "simple-peer";
import { faker } from "@faker-js/faker";

interface PeerData {
  peer: SimplePeer.Instance;
  userId: string;
}

interface SignalData {
  signal: SimplePeer.SignalData;
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
    peers.forEach((peerData) => peerData.peer.destroy());
    setPeers([]);
    setRemoteVideoRefs({});
  };

  const createPeer = (userId: string, initiator: boolean) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: localVideoRef.current?.srcObject as MediaStream,
    });

    peer.on("signal", (signal) =>
      socketRef.current?.emit("signal", { userId, signal })
    );

    peer.on("stream", (stream) => {
      const videoRef = remoteVideoRefs[userId];
      if (videoRef?.current) {
        videoRef.current.srcObject = stream;
      }
    });

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
    ({ signal, userId }: SignalData) => {
      const peerData = peers.find((p) => p.userId === userId);
      if (peerData) peerData.peer.signal(signal);
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

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Instance } from "simple-peer";
import {
  Videocam,
  CallEnd,
  Mic,
  ScreenShare,
  StopScreenShareOutlined,
  VideocamOffOutlined,
  MicOffOutlined,
} from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import { toast } from "react-toastify";

interface ControlsProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  socket: Socket;
  peers: Instance[];
}

export const Controls: React.FC<ControlsProps> = ({
  localVideoRef,
  socket,
  peers,
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isVideoEnabled) startVideo();
    else stopVideoStream();

    return () => {
      stopVideoStream();
      stopScreenSharing();
    };
  }, [isVideoEnabled]);

  const stopScreenSharing = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      if (localVideoRef.current)
        localVideoRef.current.srcObject = videoStreamRef.current;
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((error: unknown) => {
          console.error("Error playing video: ", error);
        });
      }
      videoStreamRef.current = stream;
      peers.forEach((peer) => peer.addStream(stream));
    } catch (error) {
      handleMediaError(error);
    }
  };

  const stopVideoStream = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      videoStreamRef.current = null;
    }
  };

  const startScreenSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((error: unknown) => {
          console.error("Error playing screen sharing video: ", error);
        });
      }
      setIsScreenSharing(true);
      stream.getTracks()[0].addEventListener("ended", () => {
        stopScreenSharing();
      });
    } catch (error) {
      handleMediaError(error);
    }
  };

  const toggleAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isAudioEnabled));
      setIsAudioEnabled(!isAudioEnabled);
    } catch (error) {
      handleMediaError(error);
    }
  };
  const toggleScreenSharing = async () => {
    if (isScreenSharing) stopScreenSharing();
    else startScreenSharing();
  };

  const toggleVideo = async () => setIsVideoEnabled((prev) => !prev);

  const handleMediaError = (error: unknown) =>
    error instanceof Error &&
    toast.error(error.message, { toastId: error.message });

  return (
    <div className="controls-container">
      <IconButton onClick={toggleAudio}>
        {isAudioEnabled ? (
          <Mic style={{ color: "#4caf50" }} />
        ) : (
          <MicOffOutlined style={{ color: "#f44336" }} />
        )}
      </IconButton>
      <IconButton onClick={toggleVideo}>
        {isVideoEnabled ? (
          <Videocam style={{ color: "#4caf50" }} />
        ) : (
          <VideocamOffOutlined style={{ color: "#f44336" }} />
        )}
      </IconButton>
      <IconButton onClick={toggleScreenSharing}>
        {isScreenSharing ? (
          <StopScreenShareOutlined style={{ color: "#f44336" }} />
        ) : (
          <ScreenShare style={{ color: "#2196f3" }} />
        )}
      </IconButton>
      <IconButton onClick={() => socket.emit("end-call")}>
        <CallEnd style={{ color: "#ff1744" }} />
      </IconButton>
    </div>
  );
};

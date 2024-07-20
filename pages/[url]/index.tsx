import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  Input,
  IconButton,
  Badge,
  Modal,
  Typography,
} from "@material-ui/core";
import {
  Videocam,
  CallEnd,
  Mic,
  ScreenShare,
  CheckCircle,
  FileCopyOutlined,
  ChatOutlined,
  StopScreenShareOutlined,
  VideocamOffOutlined,
  MicOffOutlined,
} from "@material-ui/icons";
import "@app/styles/video.css";

interface Message {
  sender: string;
  content: string;
}

const VideoChat = () => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isScreenAvailable, setIsScreenAvailable] = useState(true);
  const [isInviteLinkCopied, setIsInviteLinkCopied] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const handleInputChange =
    (setter: Dispatch<SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setter(e.target.value);

  const toggleState = (setter: Dispatch<SetStateAction<boolean>>) => () =>
    setter((prev) => !prev);

  const handleEndCall = () => console.log("End call");

  const handleOpenChat = () => setIsChatModalOpen(true);

  const handleCloseChat = () => setIsChatModalOpen(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;
  };

  const handleCopyInviteLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setIsInviteLinkCopied(true);
    setTimeout(() => setIsInviteLinkCopied(false), 1000);
  };

  const renderMessages = () =>
    messages.length > 0 ? (
      messages.map((msg, index) => (
        <div key={index} className="message">
          <p className="messageContent">
            <b>{msg.sender}</b>: {msg.content}
          </p>
        </div>
      ))
    ) : (
      <p>No messages yet</p>
    );

  const ChatModal = () => (
    <Modal
      open={isChatModalOpen}
      onClose={handleCloseChat}
      className="modalOverlay"
    >
      <div className="modalContent">
        <div className="modalHeader">
          <Typography variant="h6">Chat Room</Typography>
          <Button onClick={handleCloseChat}>Close</Button>
        </div>
        <div className="modalBody">{renderMessages()}</div>
        <div className="modalFooter">
          <Input
            placeholder="Message"
            value={message}
            onChange={handleInputChange(setMessage)}
            className="chatInput"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );

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

  const toggleVideo = async () => {
    setIsVideoEnabled((prev) => !prev);
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((error) => {
          console.error("Error playing video: ", error);
        });
      }
      videoStreamRef.current = stream;
    } catch (error) {
      handleMediaError(error);
    }
  };

  useEffect(() => {
    if (isVideoEnabled) startVideo();
    else stopVideoStream();

    return () => {
      stopVideoStream();
      stopScreenSharing();
    };
  }, [isVideoEnabled]);

  const stopVideoStream = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      videoStreamRef.current = null;
    }
  };

  const toggleScreenSharing = async () => {
    if (isScreenSharing) stopScreenSharing();
    else startScreenSharing();
  };

  const startScreenSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((error) => {
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

  const stopScreenSharing = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = videoStreamRef.current;
      }
    }
  };

  const handleMediaError = (error: unknown) =>
    error instanceof Error &&
    toast.error(error.message, { toastId: error.message });

  const Controls = () => (
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
      {isScreenAvailable && (
        <IconButton onClick={toggleScreenSharing}>
          {isScreenSharing ? (
            <StopScreenShareOutlined style={{ color: "#f44336" }} />
          ) : (
            <ScreenShare style={{ color: "#2196f3" }} />
          )}
        </IconButton>
      )}
      <Badge
        badgeContent={newMessagesCount}
        max={999}
        color="secondary"
        overlap="rectangular"
        onClick={handleOpenChat}
      >
        <IconButton onClick={handleOpenChat}>
          <ChatOutlined style={{ color: "#9c27b0" }} />
        </IconButton>
      </Badge>
      <IconButton onClick={handleEndCall}>
        <CallEnd style={{ color: "#ff1744" }} />
      </IconButton>
    </div>
  );

  const InviteLink = () => (
    <div className="invite-container">
      <Input
        value={typeof window !== "undefined" && window.location.href}
        disableUnderline
        readOnly
      />
      <IconButton onClick={handleCopyInviteLink}>
        {isInviteLinkCopied ? (
          <CheckCircle style={{ color: "#4caf50" }} />
        ) : (
          <FileCopyOutlined />
        )}
      </IconButton>
    </div>
  );

  const VideoContainer = () => (
    <div className="video-container">
      <video ref={localVideoRef} autoPlay muted />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <ChatModal />
      <InviteLink />
      <VideoContainer />
      <Controls />
    </>
  );
};

export default VideoChat;

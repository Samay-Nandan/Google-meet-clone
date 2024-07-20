import { useState, useRef, ChangeEvent, Dispatch, SetStateAction } from "react";
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

  const Controls = () => (
    <div className="controls-container">
      <IconButton onClick={toggleState(setIsAudioEnabled)}>
        {isAudioEnabled ? (
          <Mic style={{ color: "#4caf50" }} />
        ) : (
          <MicOffOutlined style={{ color: "#f44336" }} />
        )}
      </IconButton>
      <IconButton onClick={toggleState(setIsVideoEnabled)}>
        {isVideoEnabled ? (
          <Videocam style={{ color: "#4caf50" }} />
        ) : (
          <VideocamOffOutlined style={{ color: "#f44336" }} />
        )}
      </IconButton>
      {isScreenAvailable && (
        <IconButton onClick={toggleState(setIsScreenSharing)}>
          {isScreenSharing ? (
            <ScreenShare style={{ color: "#2196f3" }} />
          ) : (
            <StopScreenShareOutlined style={{ color: "#f44336" }} />
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
      <ChatModal />
      <InviteLink />
      <VideoContainer />
      <Controls />
    </>
  );
};

export default VideoChat;

import { ToastContainer } from "react-toastify";
import { InviteUrl, Controls, Video } from "@app/components";
import { useSocket } from "@app/hooks";
import "react-toastify/dist/ReactToastify.css";
import "@app/styles/video.css";

const VideoChat = () => {
  const { peers, remoteVideoRefs, socketRef, localVideoRef } = useSocket();

  return (
    <>
      <ToastContainer />
      <InviteUrl />
      <Video localVideoRef={localVideoRef} remoteVideoRefs={remoteVideoRefs} />
      {socketRef.current && (
        <Controls
          localVideoRef={localVideoRef}
          socket={socketRef.current}
          peers={peers.map(({ peer }) => peer)}
        />
      )}
    </>
  );
};

export default VideoChat;

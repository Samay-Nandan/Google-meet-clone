import { FC, RefObject } from "react";

interface VideoProps {
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRefs: Record<string, RefObject<HTMLVideoElement>>;
}

const VideoContainer: FC<{ refObj: RefObject<HTMLVideoElement> }> = ({
  refObj,
}) => (
  <div className="video-container">
    <video ref={refObj} autoPlay muted />
  </div>
);

export const Video: FC<VideoProps> = ({ localVideoRef, remoteVideoRefs }) => (
  <div className="videos">
    <VideoContainer refObj={localVideoRef} />
    {Object.entries(remoteVideoRefs).map(([key, ref]) => (
      <VideoContainer key={key} refObj={ref} />
    ))}
  </div>
);

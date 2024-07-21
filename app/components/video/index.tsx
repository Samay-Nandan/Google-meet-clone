import { FC, RefObject } from "react";

interface VideoProps {
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRefs: Record<string, RefObject<HTMLVideoElement>>;
}

export const Video: FC<VideoProps> = ({ localVideoRef, remoteVideoRefs }) => (
  <div className="video-container">
    <video ref={localVideoRef} autoPlay muted />
    {Object.values(remoteVideoRefs).map((ref, index) => (
      <video key={index} ref={ref} autoPlay />
    ))}
  </div>
);

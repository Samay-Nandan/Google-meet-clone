import { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer, Socket } from "socket.io";

interface SignalData {
  roomId: string;
  signal: RTCSessionDescriptionInit | RTCIceCandidate;
  userId: string;
}

const initializeSocketServer = (httpServer: HTTPServer): IOServer => {
  const io = new IOServer(httpServer, {
    path: "/api/socket",
  });
  io.on("connection", handleConnection);
  return io;
};

const handleConnection = (socket: Socket): void => {
  console.log(`User connected: ${socket.id}`);
  socket.on("disconnect", () => handleDisconnect(socket));
  socket.on("join-room", (roomId, userId) =>
    handleJoinRoom(socket, roomId, userId)
  );
  socket.on("signal", (data) => handleSignal(socket, data));
};

const handleJoinRoom = (
  socket: Socket,
  roomId: string,
  userId: string
): void => {
  socket.join(roomId);
  socket.broadcast
    .to(roomId)
    .emit("user-connected", { userId, socketId: socket.id });
};

const handleSignal = (socket: Socket, { roomId, signal, userId }: SignalData) =>
  socket.broadcast.to(roomId).emit("signal", { signal, userId });

const handleDisconnect = (socket: Socket): void =>
  console.log(`User disconnected: ${socket.id}`);

const SocketHandler = (
  request: NextApiRequest,
  response: NextApiResponse
): void => {
  if (!response.socket.server.io) {
    console.log("Setting up socket.io server...");
    response.socket.server.io = initializeSocketServer(response.socket.server);
  } else {
    console.log("Socket.io server already set up");
  }
  response.end();
};

export default SocketHandler;

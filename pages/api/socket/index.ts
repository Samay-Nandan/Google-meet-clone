import { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer, Socket } from "socket.io";

const setupSocketServer = (httpServer: HTTPServer): IOServer => {
  const io = new IOServer(httpServer, {
    path: "/api/socket",
  });
  io.on("connection", handleConnection);
  return io;
};

const handleConnection = (socket: Socket): void => {
  console.log(`User connected: ${socket.id}`);
  socket.on("send_message", (message) => handleMessage(socket, message));
  socket.on("disconnect", () => handleDisconnect(socket));
};

const handleMessage = (socket: Socket, message: string): void => {
  console.log(`Message from ${socket.id}: ${message}`);
  socket.broadcast.emit("receive_message", message);
};

const handleDisconnect = (socket: Socket): void =>
  console.log(`User disconnected: ${socket.id}`);

const SocketHandler = (
  request: NextApiRequest,
  response: NextApiResponse
): void => {
  if (!response.socket.server.io) {
    console.log("Setting up socket.io server...");
    response.socket.server.io = setupSocketServer(response.socket.server);
  } else {
    console.log("Socket.io server already set up");
  }
  response.end();
};

export default SocketHandler;

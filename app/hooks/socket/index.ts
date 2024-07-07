import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (path: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const handleConnect = () => console.log("Connected to server");

  const handleMessageReceive = (message: string) =>
    setMessages((prevMessages) => [...prevMessages, message]);

  useEffect(() => {
    const socketInstance = io({ path });

    socketInstance.on("connect", handleConnect);
    socketInstance.on("receive_message", handleMessageReceive);

    setSocket(socketInstance);
  }, [path]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!socket) return;
      socket.emit("send_message", message);
    },
    [socket]
  );

  return { socket, messages, sendMessage };
};

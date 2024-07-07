"use client";

import { useState } from "react";
import { useSocket } from "@app/hooks";

const Home = () => {
  const [message, setMessage] = useState("");
  const { messages, sendMessage } = useSocket("/api/socket");

  const handleSendMessage = () => {
    if (!message) return;
    sendMessage(message);
    setMessage("");
  };

  return (
    <div>
      <h1>Socket.io with Next.js and TypeScript</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;

"use client";

import { useState, ChangeEvent } from "react";
import { Input, Button } from "@material-ui/core";
import "@app/styles/home.css";

const Home = () => {
  const [meetingUrl, setMeetingUrl] = useState("");

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) =>
    setMeetingUrl(event.target.value);

  const generateMeetingUrl = () =>
    meetingUrl
      ? meetingUrl.split("/").pop()
      : Math.random().toString(36).substring(2, 7);

  const handleJoinMeeting = () => {
    window.location.href = "/" + generateMeetingUrl();
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Video Meeting</h1>
        <p>
          Stay connected with your friends through our seamless video
          conferencing solution.
        </p>
      </header>
      <div className="input-container">
        <Input
          placeholder="Enter meeting URL or leave blank to create new"
          onChange={handleUrlChange}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleJoinMeeting}>
          Go
        </Button>
      </div>
    </div>
  );
};

export default Home;

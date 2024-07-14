"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Input, Button } from "@material-ui/core";
import { faker } from "@faker-js/faker";
import "@app/styles/home.css";

const Home = () => {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(faker.internet.userName());
    setMeetingCode(faker.string.uuid());
  }, []);

  const handleMeetingUrlChange = (event: ChangeEvent<HTMLInputElement>) =>
    setMeetingUrl(event.target.value);

  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) =>
    setUserName(event.target.value);

  const getMeetingCodeFromUrl = () =>
    meetingUrl ? meetingUrl.split("/").pop() : meetingCode;

  const handleJoinMeeting = () => {
    window.location.href = `/${getMeetingCodeFromUrl()}`;
  };

  return (
    <div className="container">
      <header>
        <h1>Video Meeting</h1>
        <p>
          Stay connected with your friends through our seamless video
          conferencing solution.
        </p>
      </header>
      <div className="input-container">
        <Input
          placeholder={`Enter or use the generated name: ${userName}`}
          onChange={handleUserNameChange}
          fullWidth
          disableUnderline
        />
        <Input
          placeholder={`Enter or use the generated meeting code: ${meetingCode}`}
          onChange={handleMeetingUrlChange}
          fullWidth
          disableUnderline
        />
        <Button variant="contained" color="primary" onClick={handleJoinMeeting}>
          Join Meeting
        </Button>
      </div>
    </div>
  );
};

export default Home;

import { useState } from "react";
import { Input, IconButton } from "@material-ui/core";
import { CheckCircle, FileCopyOutlined } from "@material-ui/icons";

export const InviteUrl = () => {
  const [isInviteLinkCopied, setIsInviteLinkCopied] = useState(false);

  const handleCopyInviteLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setIsInviteLinkCopied(true);
    setTimeout(() => setIsInviteLinkCopied(false), 1000);
  };

  return (
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
};

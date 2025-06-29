// src/components/Message.tsx
import React, { Fragment } from "react";
import { MessageDto } from "../models/MessageDto";

interface MessageProps {
  message: MessageDto;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  // Function to render text with clickable links
  const renderTextWithLinks = (text: string) => {
    // Regex to match markdown-style links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the link
      const linkText = match[1];
      const linkUrl = match[2];
      
      // Handle relative URLs by making them absolute
      let absoluteUrl = linkUrl;
      if (linkUrl.startsWith('/')) {
        // Get the current domain
        const currentDomain = window.location.origin;
        absoluteUrl = currentDomain + linkUrl;
      }

      parts.push(
        <a
          key={match.index}
          href={absoluteUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: message.isUser ? "#ffffff" : "#0066cc",
            textDecoration: "underline",
            fontWeight: "bold"
          }}
        >
          {linkText}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div style={{ textAlign: message.isUser ? "right" : "left", margin: "8px" }}>
      <div
        style={{
          color: message.isUser ? "#ffffff" : "#000000",
          backgroundColor: message.isUser ? "#388087" : "#eaeaea",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        {message.content.split("\n").map((text, index) => (
          <Fragment key={index}>
            {renderTextWithLinks(text)}
            <br />
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default Message;
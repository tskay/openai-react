// src/components/Chat.tsx
import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Container,
  Grid,
  LinearProgress,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Message from "./Message";
import OpenAI from "openai";
import { MessageDto } from "../models/MessageDto";
import SendIcon from "@mui/icons-material/Send";

const Chat: React.FC = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<MessageDto>>([]);
  const [input, setInput] = useState<string>("");
  const [assistant, setAssistant] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [openai, setOpenai] = useState<any>(null);
  const [personality, setPersonality] = useState<string>("Carl Sagan");

  // Map personality names to personality-specific instructions
  const personalityPrompts: Record<string, string> = {
    "Carl Sagan":
      "Explain topics with cosmic wonder and scientific curiosity, as if you're unveiling the mysteries of the universe.",
    "Dora the Explorer":
      "Speak in a friendly, encouraging manner with simple language that invites exploration.",
    "Uncle Roger":
      "Offer humorous, blunt advice with a touch of sarcasm.",
  };

  // Combine the base instructions with the personality-specific style.
  const getInstructions = () => {
    return `You are a Sustainable Development Goal Consultant in the style of ${personality}. ${personalityPrompts[personality]} Restrict your responses to the topic of United Nations Sustainable Development Goals where possible.`;
  };

  // Reinitialize the chatbot whenever the personality changes.
  useEffect(() => {
    initChatBot();
  }, [personality]);

  // Reset messages when a new assistant is initialized.
  useEffect(() => {
    setMessages([
      {
        content: "Hi, got a burning question? Ask away.",
        isUser: false,
      },
    ]);
  }, [assistant]);

  const initChatBot = async () => {
    const openaiInstance = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    // Create an assistant with personality-specific instructions.
    const assistantInstance = await openaiInstance.beta.assistants.create({
      name: "Sustainable Development Goal Consultant",
      instructions: getInstructions(),
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o",
    });

    // Create a new thread for the conversation.
    const threadInstance = await openaiInstance.beta.threads.create();

    setOpenai(openaiInstance);
    setAssistant(assistantInstance);
    setThread(threadInstance);
  };

  const createNewMessage = (content: string, isUser: boolean) => {
    return new MessageDto(isUser, content);
  };

  const handleSendMessage = async () => {
    // Add the user's message to the conversation.
    messages.push(createNewMessage(input, true));
    setMessages([...messages]);
    const userInput = input; // capture the current input
    setInput("");

    // Send the user's message to the thread.
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userInput,
    });

    // Run the assistant.
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Retrieve the assistant's response.
    let response = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // Poll until the response is ready.
    while (response.status === "in_progress" || response.status === "queued") {
      console.log("waiting...");
      setIsWaiting(true);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    setIsWaiting(false);

    // Get the messages for the thread.
    const messageList = await openai.beta.threads.messages.list(thread.id);

    // Find the last message from the assistant for the current run.
    const lastMessage = messageList.data
      .filter(
        (message: any) =>
          message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    if (lastMessage) {
      const assistantResponse = lastMessage.content[0]["text"].value;
      console.log(assistantResponse);
      setMessages([...messages, createNewMessage(assistantResponse, false)]);
    }
  };

  // Detect enter key to send the message.
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Container>
      {/* Personality Selection */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="personality-select-label">
              Select Personality
            </InputLabel>
            <Select
              labelId="personality-select-label"
              value={personality}
              label="Select Personality"
              onChange={(e) => setPersonality(e.target.value as string)}
            >
              <MenuItem value="Carl Sagan">Carl Sagan</MenuItem>
              <MenuItem value="Dora the Explorer">Dora the Explorer</MenuItem>
              <MenuItem value="Uncle Roger">Uncle Roger</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Conversation Messages */}
      <Grid container direction="column" spacing={2} paddingBottom={2}>
        {messages.map((message, index) => (
          <Grid
            item
            alignSelf={message.isUser ? "flex-end" : "flex-start"}
            key={index}
          >
            <Message message={message} />
          </Grid>
        ))}
      </Grid>

      {/* Input and Send Button */}
      <Grid container direction="row" paddingBottom={5} justifyContent="space-between">
        <Grid item sm={11} xs={9}>
          <TextField
            label="Type your message"
            variant="outlined"
            disabled={isWaiting}
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          {isWaiting && <LinearProgress color="inherit" />}
        </Grid>
        <Grid item sm={1} xs={3}>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#6FB3B8", // your custom color
              "&:hover": { backgroundColor: "#388087" }, // custom hover color
            }}
            onClick={handleSendMessage}
            disabled={isWaiting}
          >
            {isWaiting ? (
              <CircularProgress color="inherit" />
            ) : (
              <SendIcon fontSize="large" />
            )}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;

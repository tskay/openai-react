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
  Box,
  Typography,
} from "@mui/material";
import Message from "./Message";
import OpenAI from "openai";
import { MessageDto } from "../models/MessageDto";
import SendIcon from "@mui/icons-material/Send";

const Chat: React.FC = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<MessageDto>>([]);
  const [input, setInput] = useState<string>("");
  // Set the default personality to one of the available ones.
  const [personality, setPersonality] = useState<string>("Dora the Explorer");
  const [assistant, setAssistant] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [openai, setOpenai] = useState<any>(null);

  // Map personality names to personality-specific instructions
  const personalityPrompts: Record<string, string> = {
    "Dora the Explorer":
      "Speak in a friendly, encouraging manner with simple language that invites exploration.",
    "Uncle Roger":
      "Offer humorous, blunt advice with a touch of sarcasm.",
    "David Attenborough":
      "Narrate topics with a calm, insightful, and descriptive tone that captures the beauty and complexity of the natural world.",
    "Kpop Fan":
      "Respond with energetic enthusiasm and modern slang, referencing K-pop culture and trends to keep the conversation lively.",
    "Gen Alpha":
      "Respond with youthful energy and internet-savvy slang, frequently using trendy expressions like 'skibidi' and 'alpha sigma', while still addressing the topic of United Nations Sustainable Development Goals.",
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

  // Handler for personality change
  const handlePersonalityChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const selected = e.target.value as string;
    if (selected === "Surprise Me") {
      // Choose a random personality from the available ones.
      const available = Object.keys(personalityPrompts);
      const randomPersonality = available[Math.floor(Math.random() * available.length)];
      setPersonality(randomPersonality);
    } else {
      setPersonality(selected);
    }
  };

  return (
    <Container>
      {/* Prominent Personality Selector */}
      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          p: 2,
          borderRadius: 2,
          mt: "10px", // shifts the selector 10px further down
          mb: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Who would you like to speak to?
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="personality-select-label">Select Personality</InputLabel>
          <Select
            labelId="personality-select-label"
            value={personality}
            label="Select Personality"
            onChange={handlePersonalityChange}
            sx={{ fontSize: "1.1rem" }}
          >
            <MenuItem value="Surprise Me">Surprise Me</MenuItem>
            <MenuItem value="Dora the Explorer">Dora the Explorer</MenuItem>
            <MenuItem value="Uncle Roger">Uncle Roger</MenuItem>
            <MenuItem value="David Attenborough">David Attenborough</MenuItem>
            <MenuItem value="Kpop Fan">Kpop Fan</MenuItem>
            <MenuItem value="Gen Alpha">Gen Alpha</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
              "&:hover": { backgroundColor: "#388087" },
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

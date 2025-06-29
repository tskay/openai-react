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
  Snackbar,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import Message from "./Message";
import OpenAI from "openai";
import { MessageDto } from "../models/MessageDto";
import SendIcon from "@mui/icons-material/Send";

const Chat: React.FC = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<MessageDto>>([]);
  const [input, setInput] = useState<string>("");
  const [personality, setPersonality] = useState<string>("Dora the Explorer");
  const [assistant, setAssistant] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [openai, setOpenai] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

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

  const getInstructions = () => {
  return `You are an educational chatbot advisor for CEnergy: Powering a Sustainable Future—a site dedicated to UN SDG 7: ensuring access to affordable, reliable, sustainable, modern energy for all. Respond in the style of ${personality}.

${personalityPrompts[personality]}

Your mission:
- Educate on clean energy (solar, wind, hydro), access, efficiency, innovation.
- Raise awareness of global energy challenges and inspiring solutions.

✨ **Interactive prompts**:  
When users ask for motivation or inspiration, suggest:
- "Need a boost? Check out our **Inspirational Quotes** on energy heroes & sustainable journeys here: [Quotes](https://ygk4tt-5000.csb.app/quotes.html)."
- "Looking for reassurance? Find daily clean‑energy inspiration in our [Quotes](https://ygk4tt-5000.csb.app/quotes.html) section."

On other topics, invite the user to:
- "Test your energy IQ with our [Clean Energy Quiz](https://ygk4tt-5000.csb.app/quiz.html)!"
- "Explore fact vs myth in renewable energy on [Fact vs Myth](https://ygk4tt-5000.csb.app/factvsmyth.html)."
- "Try our interactive energy challenge game here: [Energy Game](https://ygk4tt-5000.csb.app/game.html)."
- "Prefer a chat? I'm here—visit: [Chat with CEnergy](https://ygk4tt-5000.csb.app/chatbot)."

💡 **Best practices for using inspirational quotes**:
- Use quotes to spark curiosity and emotion—short, resonant, themed around energy (e.g., "Energy is the golden thread…") :contentReference[oaicite:1]{index=1}.
- Encourage reflection: "Which quote motivates you the most today?"
- Pair quotes with visuals or infographics—this drives emotional engagement and shares better on social platforms :contentReference[oaicite:2]{index=2}.

🥇 **Style tips for chatbot replies**:
- Be concise and conversational.
- Offer guiding questions like, "Want to read another?"
- Use quick-reply buttons where possible (e.g., "🔁 More quote", "Take quiz").

🔄 **If asked about other SDGs**, briefly explain their link to SDG 7 (like energy supporting health, education, etc.)—then steer back with a relevant prompt ("Want to explore clean‑energy quotes on how energy transforms lives?").

🚫 Do **not** respond on unrelated topics. Keep content focused on SDG 7 and use interactive elements—links, buttons, quizzes, games, quotes—to inspire, educate, and guide users toward sustainable energy awareness.`;
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
    messages.push(createNewMessage(input, true));
    setMessages([...messages]);
    const userInput = input;
    setInput("");

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userInput,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    let response = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    while (response.status === "in_progress" || response.status === "queued") {
      console.log("waiting...");
      setIsWaiting(true);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    setIsWaiting(false);

    const messageList = await openai.beta.threads.messages.list(thread.id);

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handlePersonalityChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value;
    if (selected === "Surprise Me") {
      const available = Object.keys(personalityPrompts);
      const randomPersonality =
        available[Math.floor(Math.random() * available.length)];
      setPersonality(randomPersonality);
      setSnackbarMessage(
        `Surprise! Your personality has been set to ${randomPersonality}.`
      );
      setSnackbarOpen(true);
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
          mt: "10px",
          mb: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Who would you like to speak to?
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="personality-select-label">
            Select Personality
          </InputLabel>
          <Select
            labelId="personality-select-label"
            value={personality}
            label="Select Personality"
            onChange={handlePersonalityChange}
            sx={{ fontSize: "1.1rem" }}
          >
            <MenuItem value="Surprise Me">Surprise Me!</MenuItem>
            <MenuItem value="Dora the Explorer">Dora the Explorer</MenuItem>
            <MenuItem value="Uncle Roger">Uncle Roger</MenuItem>
            <MenuItem value="David Attenborough">
              David Attenborough
            </MenuItem>
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
      <Grid
        container
        direction="row"
        paddingBottom={5}
        justifyContent="space-between"
      >
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
              backgroundColor: "#6FB3B8",
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

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Chat;

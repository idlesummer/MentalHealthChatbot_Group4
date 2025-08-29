import "dotenv/config";
import express from "express";
import cors from "cors";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    temperature: 0.2,
});

// POST /api/chat
app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "message must be a string" });
        }

        // Only system + one human input
        const msgs = [
            new SystemMessage("You are a supportive mental health assistant."),
            new HumanMessage(message.trim())
        ];

        const reply = await model.invoke(msgs);
        res.json({ reply: reply.content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`🚀 API running at http://localhost:${port}`));
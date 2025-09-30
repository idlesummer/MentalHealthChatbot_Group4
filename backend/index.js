import "dotenv/config";
import express from "express";
import cors from "cors";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import prompts from "./techniques/prompts.js";
import { z } from "zod";


const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const ReplySchema = z.object({
    reply: z.string(),
    context: z.string(),
});

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    temperature: 0.2,
}).withStructuredOutput(ReplySchema);

const prompt = ChatPromptTemplate.fromMessages([
    ["system",
        ` 
        Use this Prompt Technique: {promptTechnique}
        You are a supportive mental health assistant. Be empathetic, concise, and practical.
        You must return a JSON object with two keys:
        - "reply": what you would say directly to the user
        - "context": an updated concise summary of the conversation so far
        `
    ],
    ["system", `The current conversation context is (This may be empty): {context}`],
    ["human", `This is the user's latest message: {message}`],
]);

// POST /api/chat
app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        console.log("Request: ", req.body);
        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "message must be a string" });
        }

        const promptTechnique = prompts[req.body.effectiveTechnique] ?? prompts["baseline"] ?? "You are a supportive mental health assistant.";

        const response = await model.invoke(
            await prompt.formatMessages({
                promptTechnique: promptTechnique,
                message: message.trim(),
                context: req.body.context || "No context yet.",
            })
        );
        
        console.log("Response: ", response)
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API running at http://localhost:${port}`));


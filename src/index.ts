import dotenv from "dotenv";
import express, { Request, Response } from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;
console.log("PORT", PORT);
app.use(express.json());
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//@ts-expect-error - This is a valid route
app.post("/prompt", async (req: Request, res: Response): Promise<Response> => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Prompt message is required!" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content }],
    });

    if (!response || !response.choices || response.choices.length === 0) {
      return res.status(500).json({ error: "Failed to generate a response." });
    }

    const choice = response.choices[0];
    console.log("Response from OpenAI:", choice);

    return res.status(200).json({
      message: `${choice.message.content}`,
    });
  } catch (error: unknown) {
    console.error("Error occurred:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

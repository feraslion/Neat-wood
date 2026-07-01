import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini API client lazily
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Chat endpoint with Gemini
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGeminiClient();
    
    // We can use the chat API
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "أنت مساعد ذكي ومتعاون ومحترف مدمج في نظام نوافذ مساحة العمل التفاعلية. تجيب بإيجاز واحترافية باللغة العربية. ساعد المستخدم في إدارة مهامه، تنظيم أفكاره، أو الإجابة على استفساراته العامة.",
      },
    });

    // Populate history if provided
    if (history && Array.isArray(history)) {
      // Reconstruct history
      // Note: chat history in GoogleGenAI has a specific format. 
      // Instead of manual history injection if it's complex, we can also use direct generateContent with historical context,
      // or set history directly. For simplicity and robustness, we can send the messages formatted or pass to chat.
      // Let's format previous turns as a structured system/user/model context, or just feed them as contents.
      // Let's use direct generateContent with contents array for multi-turn if history is provided:
      const contents = history.map((h: { role: string; text: string }) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text }],
      }));
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "أنت مساعد ذكي ومتعاون ومحترف مدمج في نظام نوافذ مساحة العمل التفاعلية. تجيب بإيجاز واحترافية باللغة العربية.",
        }
      });

      res.json({ text: response.text });
      return;
    }

    // Single message fallback
    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ 
      error: error.message || "فشل الاتصال بمساعد الذكاء الاصطناعي. يرجى التأكد من إعداد مفتاح API الخاص بـ Gemini في Secrets." 
    });
  }
});

// Setup Vite or Static assets serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
});

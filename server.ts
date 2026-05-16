import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const SYSTEM_PROMPT = `
# ═══════════════════════════════════════════════════════════
# CHAMA DISPUTE ARBITRATOR — SYSTEM PROMPT
# For Google AI Studio · Gemini 1.5 Pro (or Flash)
# ═══════════════════════════════════════════════════════════

## IDENTITY & MANDATE
You are **Msuluhishi wa Chama** (Chama Dispute Arbitrator), a neutral AI mediator trained to resolve internal disputes within Kenyan investment groups (chamas). You operate with the authority of the chama's own bylaws, contribution records, and financial statements — nothing more, nothing less.

You are NOT a lawyer. You are NOT a financial advisor. You are a fair, evidence-based mediator who cites the chama's own documents.

## LANGUAGE PROTOCOL
You MUST detect and match the user's language automatically:
- **English** → respond in English
- **Kiswahili** → jibu kwa Kiswahili rasmi
- **Sheng** → jibu kwa Sheng ukichanganya na Kiswahili/English kadri inavyofaa
- **Mixed / code-switching** → mirror the same blend

## DOCUMENT INGESTION
When documents are provided, extract and index bylaws, M-Pesa statements, and contribution records.

## DISPUTE INTAKE PROTOCOL
Collect nature of dispute, parties, amount, timeline, and evidence if not already provided.

## ARBITRATION FRAMEWORK
Structure every ruling as follows:
### 📋 MUHTASARI WA MGOGORO / DISPUTE SUMMARY
### 📜 SHERIA HUSIKA / APPLICABLE BYLAWS
### 📊 USHAHIDI WA FEDHA / FINANCIAL EVIDENCE
### ⚖️ UAMUZI / RULING
### 🤝 HATUA ZA UPATANISHO / RECONCILIATION STEPS
### ⚠️ ONYO / ESCALATION NOTE

## BEHAVIORAL RULES
- Always cite specific bylaw clauses.
- Always use exact figures.
- Acknowledge both sides.
- Flag discrepancies factually.
- Remind users of confidentiality.
`;

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, bylaws, mpesa, lang } = req.body;
      
      let dynamicSystemPrompt = SYSTEM_PROMPT;

      if (lang === 'en') {
        dynamicSystemPrompt += `\n\nOVERRIDE LANGUAGE PROTOCOL: You MUST respond EXCLUSIVELY in English.`;
      } else if (lang === 'sw') {
        dynamicSystemPrompt += `\n\nOVERRIDE LANGUAGE PROTOCOL: You MUST respond EXCLUSIVELY in Swahili or Sheng as appropriate for the context.`;
      }
      
      if (bylaws) {
        dynamicSystemPrompt += `\n\n[PROVIDED BYLAWS]\n${bylaws}\n\nIMPORTANT: Use these provided bylaws strictly for your ruling.`;
      }
      
      if (mpesa) {
        dynamicSystemPrompt += `\n\n[PROVIDED M-PESA STATEMENTS]\n${mpesa}\n\nIMPORTANT: Use these financial records to verify transactions and discrepancies.`;
      }

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: dynamicSystemPrompt,
        },
        // Transform history if needed. Note: SDK might expect history in a specific format.
        // Assuming history is from the client in the same format {role, parts}
        history: history || [],
      });

      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

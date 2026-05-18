var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var SYSTEM_PROMPT = `
# \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
# CHAMA DISPUTE ARBITRATOR \u2014 SYSTEM PROMPT
# For Google AI Studio \xB7 Gemini 1.5 Pro (or Flash)
# \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

## IDENTITY & MANDATE
You are **Msuluhishi wa Chama** (Chama Dispute Arbitrator), a neutral AI mediator trained to resolve internal disputes within Kenyan investment groups (chamas). You operate with the authority of the chama's own bylaws, contribution records, and financial statements \u2014 nothing more, nothing less.

You are NOT a lawyer. You are NOT a financial advisor. You are a fair, evidence-based mediator who cites the chama's own documents.

## LANGUAGE PROTOCOL
You MUST detect and match the user's language automatically:
- **English** \u2192 respond in English
- **Kiswahili** \u2192 jibu kwa Kiswahili rasmi
- **Sheng** \u2192 jibu kwa Sheng ukichanganya na Kiswahili/English kadri inavyofaa
- **Mixed / code-switching** \u2192 mirror the same blend

## DOCUMENT INGESTION
When documents are provided, extract and index bylaws, M-Pesa statements, and contribution records.

## DISPUTE INTAKE PROTOCOL
Collect nature of dispute, parties, amount, timeline, and evidence if not already provided.

## ARBITRATION FRAMEWORK
Structure every ruling as follows:
### \u{1F4CB} MUHTASARI WA MGOGORO / DISPUTE SUMMARY
### \u{1F4DC} SHERIA HUSIKA / APPLICABLE BYLAWS
### \u{1F4CA} USHAHIDI WA FEDHA / FINANCIAL EVIDENCE
### \u2696\uFE0F UAMUZI / RULING
### \u{1F91D} HATUA ZA UPATANISHO / RECONCILIATION STEPS
### \u26A0\uFE0F ONYO / ESCALATION NOTE

## BEHAVIORAL RULES
- Always cite specific bylaw clauses.
- Always use exact figures.
- Acknowledge both sides.
- Flag discrepancies factually.
- Remind users of confidentiality.
`;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const PORT = Number(process.env.PORT) || 3e3;
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, bylaws, mpesa, lang } = req.body;
      let dynamicSystemPrompt = SYSTEM_PROMPT;
      if (lang === "en") {
        dynamicSystemPrompt += `

OVERRIDE LANGUAGE PROTOCOL: You MUST respond EXCLUSIVELY in English.`;
      } else if (lang === "sw") {
        dynamicSystemPrompt += `

OVERRIDE LANGUAGE PROTOCOL: You MUST respond EXCLUSIVELY in Swahili or Sheng as appropriate for the context.`;
      }
      if (bylaws) {
        dynamicSystemPrompt += `

[PROVIDED BYLAWS]
${bylaws}

IMPORTANT: Use these provided bylaws strictly for your ruling.`;
      }
      if (mpesa) {
        dynamicSystemPrompt += `

[PROVIDED M-PESA STATEMENTS]
${mpesa}

IMPORTANT: Use these financial records to verify transactions and discrepancies.`;
      }
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: dynamicSystemPrompt
        },
        // Transform history if needed. Note: SDK might expect history in a specific format.
        // Assuming history is from the client in the same format {role, parts}
        history: history || []
      });
      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

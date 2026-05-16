# Msuluhishi wa Chama (Chama Dispute Arbitrator)

**Msuluhishi wa Chama** is a neutral AI-powered mediator designed to resolve internal disputes within Kenyan investment groups (chamas). It leverages the power of Gemini 1.5 Pro/Flash to provide evidence-based rulings grounded strictly in a chama's own bylaws and financial records.

## 📋 Key Features

-   **⚖️ Evidence-Based Arbitration**: Delivers rulings by analyzing provided bylaws and M-Pesa transaction statements.
-   **📑 Bylaws Management**: Upload or paste your chama's rules. Supports `.txt`, `.csv`, `.xls`, and `.xlsx` formats.
-   **📊 M-Pesa Auditing**: Index and cross-reference M-Pesa statements to flag discrepancies or verify contributions. Supports file uploads in multiple formats.
-   **🌍 Multilingual Support**: Seamlessly switch between **English** and **Swahili/Sheng**. The AI automatically matches your selected language for all responses.
-   **💾 Dispute History**: Save your sessions locally to reference past rulings and reconciliation steps later.
-   **🔍 Global Search**: Quickly find specific clauses in your bylaws, certain transactions in your records, or previous messages in your chat history.
-   **🛡️ Privacy First**: Data is processed securely and is not stored permanently beyond your local browser's session unless you choose to save it.

## 🚀 Tech Stack

-   **Frontend**: React 19, Vite, Tailwind CSS (v4), Motion (for animations), Lucide React (icons).
-   **Backend**: Express.js, Node.js.
-   **AI Engine**: Google Gemini API (@google/genai).
-   **Data Processing**: `xlsx` for parsing spreadsheet documents.

## 🛠️ Setup & Layout

### Environment Variables
Ensure you have a `.env` file with the following:
```env
GEMINI_API_KEY="your_api_key_here"
```

### Scripts
- `npm run dev`: Starts the development server using `tsx`.
- `npm run build`: Compiles the frontend and bundles the server into `dist/server.cjs`.
- `npm run start`: Runs the production-ready compiled server.
- `npm run lint`: Checks for TypeScript errors.

## 📖 Language Protocol
The system is optimized for:
- **English**: Formal and professional.
- **Kiswahili**: Official Kiswahili Rasmi.
- **Sheng**: Street-smart Swahili/English blend for ease of communication.

---
*Disclaimer: Msuluhishi wa Chama provides mediation based on provided digital records. It does not provide legal advice and is not a substitute for official legal counsel or registered SACCO arbitration bodies.*
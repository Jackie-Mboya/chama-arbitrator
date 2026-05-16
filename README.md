# Msuluhishi wa Chama (Chama Dispute Arbitrator)

## The Problem We're Solving

Kenya has over 300,000 registered chamas (investment groups) managing billions of shillings. While bad investments can cause losses, the real killer of chamas is **unresolved member disputes**. Disagreements over contributions, withdrawals, and rule enforcement create tension and break apart groups that could otherwise thrive.

**Msuluhishi wa Chama** is an AI arbitrator that chama treasurers can call when disputes arise. It mediates by:
- Analyzing the chama's own bylaws and rules
- Cross-referencing M-Pesa transaction statements for evidence
- Citing specific clauses to justify rulings
- Communicating in the members' language (English, Kiswahili, or Sheng)

The result: **impartial, data-driven dispute resolution that strengthens trust within chamas.**

---

## 🤖 Agent Architecture

### Core Components

**Multi-Agent Orchestration:**
- **Dispute Resolution Agent**: The main mediator that receives dispute cases, analyzes bylaws and evidence, and delivers arbitration rulings
- **Evidence Verification Agent**: Validates M-Pesa statements, flags discrepancies, and confirms transaction authenticity
- **Bylaws Parser Agent**: Ingests and indexes chama bylaws in multiple formats (TXT, CSV, XLS, XLSX) for clause retrieval
- **Language Bridge Agent**: Automatically detects input language and ensures all responses match the member's preferred language (English, Kiswahili, Sheng)

### Tools & Integration

- **Gemini 1.5 Pro/Flash API**: Core AI engine for dispute analysis and arbitration logic
- **RAG (Retrieval-Augmented Generation)**: Retrieves relevant bylaws and transaction history to ground decisions in facts
- **M-Pesa Statement Parser**: Extracts and indexes transactions from uploaded statements
- **Document Processor**: Handles multiple file formats (XLSX, CSV, TXT) for bylaws and financial records
- **Session Manager**: Stores dispute history locally for reference and future mediation

### Communication Flow

1. **Input** → Member uploads bylaws, M-Pesa statements, and describes the dispute
2. **Processing** → Evidence Verification Agent cross-references transactions; Bylaws Parser retrieves relevant clauses
3. **Mediation** → Dispute Resolution Agent analyzes evidence against bylaws and generates a ruling
4. **Output** → Language Bridge Agent ensures response matches member's language preference
5. **Storage** → Session saved locally for future reference

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Google Gemini API key

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jackie-Mboya/chama-arbitrator.git
   cd chama-arbitrator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the root directory:**
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will run at `http://localhost:5173` (frontend) and `http://localhost:3000` (backend)

### Available Scripts

- `npm run dev` — Starts the development server with hot reload
- `npm run build` — Compiles the frontend and bundles the backend into `dist/server.cjs`
- `npm run start` — Runs the production-ready compiled server
- `npm run lint` — Checks for TypeScript errors

---

## 📱 How to Interact with the Deployed Version

1. **Access the web interface**: Visit the deployed application URL
2. **Upload Bylaws**: Upload or paste your chama's bylaws (supports TXT, CSV, XLS, XLSX)
3. **Upload M-Pesa Statements**: Attach transaction records for verification
4. **Describe the Dispute**: Provide details of the disagreement in your preferred language
5. **Select Language**: Choose English, Kiswahili, or Sheng for all AI responses
6. **Get Arbitration**: The AI analyzes your bylaws and transactions, then delivers a ruling with specific clause citations
7. **Save Session**: Optionally save the dispute history locally for future reference

---

## 📸 Screenshots & Demo

[Demo Video Link](https://your-demo-link.com) — *Shows the full workflow from uploading bylaws to receiving an arbitration ruling*

*(Add screenshots of:)*
- *Bylaws upload interface*
- *M-Pesa statement verification*
- *Dispute input form*
- *Language selection*
- *Arbitration ruling output*

---

## 👥 Team Members & Roles

| Name | Role | Responsibilities |
|------|------|------------------|
| Jackie Mboya | Lead Developer & PM | Project vision, agent architecture, backend development |
| [Team Member 2] | Frontend Engineer | UI/UX, React implementation, language switching |
| [Team Member 3] | AI/ML Engineer | Gemini integration, RAG pipeline, evidence verification |
| [Team Member 4] | QA & Documentation | Testing, setup guides, user documentation |

---

## 🔒 Data Handling & Political Neutrality Policy

### Data Handling

- **No Permanent Storage**: All data (bylaws, M-Pesa statements, dispute details) is processed in the user's browser session only
- **Optional Local Save**: Members can choose to save dispute history locally; data never leaves their device
- **API-Only Transmission**: Only necessary text (stripped of sensitive transaction IDs where possible) is sent to Gemini API for analysis
- **Encryption in Transit**: HTTPS protects all communication with the backend and external APIs
- **User Control**: Members can clear all session data at any time

### Political Neutrality Policy

- **Rule-Based Arbitration**: All decisions are grounded in the chama's own bylaws and documented evidence (M-Pesa statements)
- **No Bias**: The AI engine has no knowledge of member identities, backgrounds, or external factors—only the dispute facts
- **Transparent Reasoning**: Every ruling includes specific bylaw clause citations and transaction references
- **Language Neutrality**: Decisions are delivered in the member's preferred language without favor to any group
- **Audit Trail**: All dispute cases and rulings are logged locally, enabling disputes to be re-reviewed by community moderators if needed

---

## 📋 Key Features

-   **⚖️ Evidence-Based Arbitration**: Delivers rulings by analyzing provided bylaws and M-Pesa transaction statements.
-   **📑 Bylaws Management**: Upload or paste your chama's rules. Supports `.txt`, `.csv`, `.xls`, and `.xlsx` formats.
-   **📊 M-Pesa Auditing**: Index and cross-reference M-Pesa statements to flag discrepancies or verify contributions.
-   **🌍 Multilingual Support**: Seamlessly switch between **English**, **Kiswahili**, and **Sheng**. The AI automatically matches your selected language for all responses.
-   **💾 Dispute History**: Save your sessions locally to reference past rulings and reconciliation steps later.
-   **🔍 Global Search**: Quickly find specific clauses in your bylaws, certain transactions in your records, or previous messages in your chat history.
-   **🛡️ Privacy First**: Data is processed securely and is not stored permanently beyond your local browser's session unless you choose to save it.

## 🚀 Tech Stack

-   **Frontend**: React 19, Vite, Tailwind CSS (v4), Motion (for animations), Lucide React (icons).
-   **Backend**: Express.js, Node.js.
-   **AI Engine**: Google Gemini API (@google/genai).
-   **Data Processing**: `xlsx` for parsing spreadsheet documents.

## 📖 Language Protocol
The system is optimized for:
- **English**: Formal and professional.
- **Kiswahili**: Official Kiswahili Rasmi.
- **Sheng**: Street-smart Swahili/English blend for ease of communication.

---

*Disclaimer: Msuluhishi wa Chama provides mediation based on provided digital records and chama bylaws. It does not provide legal advice and is not a substitute for official legal counsel or registered SACCO arbitration services.*

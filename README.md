# Navneet CodeLab
> **Coding Practice & Interview Preparation**

Navneet CodeLab is a comprehensive software engineering preparation platform designed for computer science students and engineers preparing for technical campus placements and software development roles.

---

## 🌟 Key Modules

1. **C++ Coding Practice (Beginner & Core DSA)**
   - Curated foundational problems spanning Arrays, Strings, Hash Maps, Stacks, and Pointers.
   - In-browser code workspace with custom input test case evaluation.
   - AI-powered code analysis: Big-O time and space complexity verification, syntax check, and modern C++ best practice recommendations.
   - 3-level progressive hints and canonical model solutions with dry-run trace steps.

2. **Project & Skill-Based Technical Questions**
   - Candidate profile customization: Add real projects, technology stacks, and key technical challenges.
   - Dynamic generation of deep-dive architectural and systems questions.
   - Multi-modal answer submission (keyboard typing or speech recognition dictation).
   - Instant scoring against expected technical concepts and model candidate answers.

3. **HR Practice (Simple English & STAR Method)**
   - Guided STAR framework (Situation, Task, Action, Result) for behavioral questions.
   - "Polish to Simple English" AI engine designed to generate crisp, natural, jargon-free answers suitable for freshers.
   - Integrated Speech Synthesis audio playback to practice vocal delivery and pacing.

4. **Interactive AI Mock Interview Room**
   - Multi-turn simulated interview session across 4 tracks: *C++ & DSA Core*, *Project Architecture*, *Campus HR*, and *Mixed Product SDE*.
   - Virtual interviewer with realistic voice output and turn-by-turn answer critique.
   - Comprehensive post-interview scorecard: hiring recommendation, competency ratings, strengths, growth areas, and a 7-day study roadmap.

5. **Placement Readiness Dashboard**
   - Dynamic Readiness Index (0–100%) tracking progress across all modules.
   - Daily practice streak counter and unlocked skill badges.
   - Persistent client-side progress logging with localStorage sync.

---

## 🚀 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, Vite middleware mode (`server.ts`).
- **AI Engine**: Google Gen AI SDK (`@google/genai`) using `gemini-3.8-flash`. All API keys are securely managed server-side via environment variables.

---

## 🛠️ Local Development & Setup

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Ensure `GEMINI_API_KEY` is configured in your environment or `.env`:
   ```bash
   GEMINI_API_KEY="your_api_key_here"
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

*Navneet CodeLab — Coding Practice & Interview Preparation*

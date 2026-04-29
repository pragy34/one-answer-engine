# ✦ One Answer Engine | Mumzworld

One Answer Engine is a **reasoning-first AI product advisor** for Mumzworld — a premium mother-and-baby e-commerce platform in the Middle East.
In **3 quick questions**, it recommends the best product in a category (e.g., strollers, formula, car seats), explains the choice in warm language (**Arabic/English**), and shows transparent “why this” reasoning.

---

## The problem it solves

Parents shopping for baby essentials face:
- Too many similar options
- High-stakes decisions (safety, newborn needs, allergies)
- Limited time and attention
- Filtering tools that don’t translate into a confident “buy this” recommendation

One Answer Engine turns a few answers into **one clear recommendation** with an explanation that builds trust.

---

## Why AI (and not just filters)

Filters answer: **“What matches my constraints?”**  
Parents need: **“What should I buy, and why?”**

This project uses AI for the parts filters can’t do well:
- Turn structured signals into **human, reassuring language** (Arabic/English)
- Summarize tradeoffs without overwhelming the user
- Provide a short, friendly explanation that feels like a real product experience

Importantly, AI here does **not** decide the winner. The system is **logic-led**:
- Filters + scoring pick the recommendation **first**
- The LLM only **explains** what the reasoning engine already chose

---

## Architecture overview (reasoning-first pipeline)

High-level flow:
1. **Frontend** asks 3 questions (bilingual, RTL support).
2. Backend extracts **structured signals** from selected options.
3. A **reasoning engine**:
   - Filters out unsuitable products
   - Scores remaining products by lifestyle fit, price fit, and review quality
   - Selects a **winner** and (optionally) a **runner-up**
   - Produces a **trust object** (confidence score, matched signals, review basis)
4. The **LLM generates a short explanation** (Arabic/English) strictly from the structured facts.
5. `/explain/{session_id}` returns **human-readable steps** for the “Why this recommendation?” panel.

**Key principle:** the reasoning engine decides *before* the LLM speaks.

---

## Features

- **3-question guided flow** (fast, low-friction)
- **Multi-category support** (strollers, formula, monitors, car seats, carriers)
- **Reasoning-first recommendation**
  - Filtering + scoring
  - Winner + runner-up
- **Trust & transparency**
  - Confidence score + label
  - Source signals used
  - “Why this” step-by-step explanation
- **Bilingual UX**
  - English + Arabic (RTL layout)
- **Interactive demo feature**
  - “What if I change one answer?” recalculates by replaying `POST /start` + `POST /answer`
- **Mumzworld CTA**
  - “View on Mumzworld” opens a search for the recommended product in a new tab

---

## Tech stack

**Frontend**
- React (Create React App)
- CSS variables design system (Inter font, RTL support)

**Backend**
- FastAPI (Python)
- Deterministic reasoning + scoring engine
- Optional LLM explanation via Groq + safe fallback template

---

## Run locally

### Prerequisites
- Node.js (LTS recommended)
- Python 3.10+ recommended

### 1) Backend (FastAPI)

From the repo root:

```bash
cd backend
python -m venv venv
```

Activate the virtualenv:

**Windows (PowerShell):**

```bash
.\venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Optional: enable LLM explanations:

```bash
# Windows (PowerShell)
$env:GROQ_API_KEY="YOUR_KEY"

# macOS/Linux
export GROQ_API_KEY="YOUR_KEY"
```

Run the API:

```bash
uvicorn main:app --reload --port 8000
```

Backend will run at `http://127.0.0.1:8000`.

### 2) Frontend (React)

In a second terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

---

## API shape (for reference)

Result object returned after the final answer:

```json
{
  "recommendation": { "product_id": "...", "name_en": "...", "name_ar": "...", "price_aed": 0, "explanation": "..." },
  "trust": {
    "confidence_score": 0.0,
    "confidence_label": "strong match | good match | possible match",
    "source_signals": ["transport: walk", "budget_tier: mid"],
    "eliminated_count": 0,
    "review_basis": "87 reviews",
    "fallback_triggered": false,
    "disclaimer_ar": "...",
    "disclaimer_en": "..."
  },
  "runner_up": {
    "product_id": "...",
    "name_en": "...",
    "name_ar": "...",
    "price_aed": 0,
    "why_not_selected": "..."
  }
}
```

Explain endpoint:

```json
{
  "steps": ["...", "...", "...", "...", "..."],
  "eliminated_products": [{ "product_id": "...", "reason_en": "...", "reason_ar": "..." }]
}
```

---

## How I built this

I built One Answer Engine to demonstrate a production-style pattern that feels trustworthy:

- The **reasoning engine decides first** (filters + scoring + winner selection).
- Only after that, the **LLM speaks** — generating a short explanation from the structured facts (and falling back to a safe template if unavailable).
- The UI is designed like a real product: bilingual/RTL, strong hierarchy, transparent reasoning, and interactive recalculation that proves the system is logic-based.


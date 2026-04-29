import json
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .extractor import extract_signals
    from .llm import generate_explanation
    from .questions import QUESTIONS
    from .reasoner import reason
    from .signal_labels import humanize_signals
    from .trust import build_response
except ImportError:
    from extractor import extract_signals
    from llm import generate_explanation
    from questions import QUESTIONS
    from reasoner import reason
    from signal_labels import humanize_signals
    from trust import build_response


app = FastAPI(title="One Answer Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATALOG_PATH = Path(__file__).with_name("catalog.json")
with open(CATALOG_PATH, encoding="utf-8") as file:
    CATALOG = json.load(file)

sessions: dict[str, dict] = {}


class StartInput(BaseModel):
    category: str


class AnswerInput(BaseModel):
    session_id: str
    answer_index: int | None = None
    language: str = "ar"


@app.post("/start")
def start(input: StartInput):
    if input.category not in QUESTIONS or input.category not in CATALOG:
        raise HTTPException(status_code=400, detail="التصنيف غير متوفر")

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "category": input.category,
        "answers": [],
        "question_index": 0,
    }

    first_question = QUESTIONS[input.category][0]
    return {
        "session_id": session_id,
        "question": first_question,
        "next_question": first_question,
    }


@app.post("/answer")
def answer(input: AnswerInput):
    session = sessions.get(input.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="الجلسة غير صالحة")

    category = session["category"]

    if session["question_index"] >= 3:
        reasoning = session.get("reasoning")
        if not reasoning:
            raise HTTPException(status_code=404, detail="ما فيه تحليل متاح")
        return _final_response(session, input.language)

    if input.answer_index is None:
        raise HTTPException(status_code=422, detail="اختاري إجابة أول")

    question = QUESTIONS[category][session["question_index"]]
    if input.answer_index < 0 or input.answer_index >= len(question["options"]):
        raise HTTPException(status_code=422, detail="اختيار الإجابة غير صحيح")

    session["answers"].append(question["options"][input.answer_index])
    session["question_index"] += 1

    if session["question_index"] < 3:
        return {"next_question": QUESTIONS[category][session["question_index"]]}

    signals = extract_signals(session["answers"])
    session["reasoning"] = reason(signals, category, CATALOG[category])
    return _final_response(session, input.language)


@app.get("/explain/{session_id}")
def explain(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="الجلسة غير صالحة")

    reasoning = session.get("reasoning")
    if not reasoning:
        raise HTTPException(status_code=404, detail="ما فيه تحليل متاح")

    human_signals = humanize_signals(reasoning["signals_used"])

    eliminated_desc = []
    for e in reasoning["eliminated_products"]:
        eliminated_desc.append(e.get("reason_en", e["product_id"]))

    steps = [
        f"We understood your situation: {', '.join(human_signals)}.",
        (
            f"We removed {len(reasoning['eliminated_products'])} products that "
            f"didn't fit: {'; '.join(eliminated_desc)}."
            if reasoning["eliminated_products"]
            else "All products passed initial filters — we scored them on lifestyle fit."
        ),
        "We scored remaining products on lifestyle match, price, and review quality.",
        (
            f"{reasoning['winner']['name_en']} scored highest "
            f"({reasoning['winner_score']:.0f} out of 100)."
        ),
        (
            f"Confidence: {int(reasoning['confidence'] * 100)}% — "
            f"based on {len(reasoning['source_signals'])} matched signals."
        ),
    ]
    return {"steps": steps}


def _final_response(session: dict, language: str) -> dict:
    reasoning = session["reasoning"]
    llm_output = generate_explanation(reasoning, language)
    session["last_language"] = language
    session["last_explanation"] = llm_output
    return build_response(reasoning, llm_output)

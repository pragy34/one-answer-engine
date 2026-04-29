import os

try:
    from .signal_labels import humanize_signals
except ImportError:
    from signal_labels import humanize_signals

try:
    from groq import Groq
except ImportError:
    Groq = None


GROQ_MODEL = "llama-3.1-8b-instant"

client = Groq(api_key=os.getenv("GROQ_API_KEY")) if Groq and os.getenv("GROQ_API_KEY") else None


def generate_explanation(reasoning: dict, language: str = "ar") -> str:
    try:
        if not client:
            return fallback_explanation(reasoning, language)

        winner = reasoning["winner"]
        fallback_note = (
            "\nLimited information available - suggest the best available option."
            if reasoning.get("fallback_triggered")
            else ""
        )

        system_prompt = """
You are a warm, knowledgeable shopping assistant for Mumzworld.

You speak in:
- Colloquial Gulf Arabic (خليجي) when language = Arabic
- Friendly, clear English when language = English

STRICT RULES:
- You ONLY use facts given in the input
- You NEVER add new features, specs, or claims
- You NEVER assume anything not explicitly provided
- You NEVER compare with products not mentioned
- If information is missing, ignore it entirely - do not guess

Tone:
- Warm, helpful, like a trusted mom friend
- Natural, conversational
- NOT formal Arabic (no MSA, no "عندما" or "حيث")
- No bullet points
- Max 4 sentences
"""

        user_prompt = f"""
A mom is shopping for a {winner['category']}.

The system has already selected:
{winner['name_en']}

Here is EXACTLY why:

User situation:
{reasoning['source_signals']}

Products removed and why:
{reasoning['eliminated_products']}

Why this product fits her:
{reasoning['matched_ideal_for']}

Review data:
{winner['review_signal']}

Price:
AED {winner['price_aed']}
{fallback_note}

TASK:
Write ONE paragraph in {"colloquial Gulf Arabic" if language == "ar" else "clear friendly English"}.

Cover:
- Why this product fits HER specific situation
- ONE honest concern from review data if top_concern exists

DO NOT:
- Add new facts not in the data above
- Mention missing information
- Use bullet points
- Use formal Arabic
"""

        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=250,
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return fallback_explanation(reasoning, language)


def fallback_explanation(reasoning: dict, language: str) -> str:
    product = reasoning["winner"]
    signals = reasoning.get("source_signals", [])
    human = humanize_signals(reasoning.get("signals_used", {}))
    situation = human[0] if human else "your situation"

    if language == "ar":
        return (
            f"بناءً على احتياجاتك، {product['name_ar']} هو الخيار "
            f"الأنسب لك بسعر {product['price_aed']} درهم."
        )
    return (
        f"For a mom who {situation}, {product['name_en']} is the best "
        f"match at AED {product['price_aed']}."
    )

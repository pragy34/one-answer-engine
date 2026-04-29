def build_response(reasoning: dict, llm_output: str) -> dict:
    return {
        "recommendation": {
            "product_id": reasoning["winner"]["id"],
            "name_en": reasoning["winner"]["name_en"],
            "name_ar": reasoning["winner"]["name_ar"],
            "price_aed": reasoning["winner"]["price_aed"],
            "explanation": llm_output,
        },
        "trust": {
            "confidence_score": reasoning["confidence"],
            "confidence_label": _confidence_label(reasoning["confidence"]),
            "source_signals": reasoning["source_signals"],
            "eliminated_count": len(reasoning["eliminated_products"]),
            "review_basis": (
                f"{reasoning['winner']['review_signal']['total_reviews']} reviews"
            ),
            "disclaimer_ar": "بناءً على إجاباتك وبيانات المنتج فقط",
            "disclaimer_en": "Based only on your answers and product data",
            "fallback_triggered": reasoning.get("fallback_triggered", False),
        },
        "runner_up": {
            "product_id": reasoning["runner_up"]["id"],
            "name_en": reasoning["runner_up"]["name_en"],
            "name_ar": reasoning["runner_up"]["name_ar"],
            "price_aed": reasoning["runner_up"]["price_aed"],
            "why_not_selected": reasoning.get("runner_up_reason"),
        } if reasoning.get("runner_up") else None,
    }


def _confidence_label(score: float) -> str:
    if score >= 0.80:
        return "strong match"
    if score >= 0.65:
        return "good match"
    if score >= 0.50:
        return "possible match"
    return "limited data"

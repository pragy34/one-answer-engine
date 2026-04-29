def reason(signals: dict, category: str, catalog: list[dict]) -> dict:
    eliminated_products = []
    surviving_products = []

    for product in catalog:
        elimination = _dealbreaker_reason(product, signals)
        if elimination:
            eliminated_products.append(elimination)
        else:
            surviving_products.append(product)

    all_eliminated_fallback = False
    if not surviving_products:
        all_eliminated_fallback = True
        surviving_products = sorted(
            catalog,
            key=lambda item: item.get("review_signal", {}).get("satisfaction_pct", 0),
            reverse=True,
        )[:2]

    scored = [_score_product(product, signals) for product in surviving_products]
    scored.sort(key=lambda item: item["score"], reverse=True)

    winner = scored[0]
    runner_up = scored[1] if len(scored) > 1 else None
    runner_up_reason = _runner_up_reason(winner, runner_up)
    confidence = _confidence_score(winner, eliminated_products, all_eliminated_fallback)

    return {
        "winner": winner["product"],
        "winner_score": winner["score"],
        "runner_up": runner_up["product"] if runner_up else None,
        "runner_up_reason": runner_up_reason,
        "confidence": confidence,
        "signals_used": signals,
        "eliminated_products": eliminated_products,
        "matched_ideal_for": winner["matched_ideal_for"],
        "scoring_breakdown": winner["breakdown"],
        "fallback_triggered": all_eliminated_fallback,
        "source_signals": [f"{key}: {value}" for key, value in signals.items()],
    }


def _dealbreaker_reason(product: dict, signals: dict) -> dict | None:
    for key, product_value in product.get("dealbreakers", {}).items():
        if key not in signals:
            continue
        signal_value = signals[key]
        if isinstance(product_value, bool) and isinstance(signal_value, bool) and product_value != signal_value:
            return {
                "product_id": product["id"],
                "reason_en": _dealbreaker_reason_en(key, product_value, signal_value),
                "reason_ar": _dealbreaker_reason_ar(key, product_value, signal_value),
            }
    return None


def _dealbreaker_reason_en(key: str, product_value: bool, signal_value: bool) -> str:
    labels = {
        "needs_car_boot": "car boot fit",
        "needs_large_basket": "large basket need",
        "needs_full_recline": "full recline need",
        "hypoallergenic_required": "hypoallergenic formula need",
        "breastfed_only": "current feeding preference",
        "video_required": "video monitor preference",
        "audio_only_preferred": "audio-only preference",
        "newborn_required": "child age stage",
        "isofix_required": "car installation setup",
        "easy_install_required": "easy installation priority",
        "back_support_required": "back support need",
    }
    label = labels.get(key, key.replace("_", " "))
    if product_value:
        return f"Requires {label}, but mom's answer does not"
    return f"Does not support {label}, but mom's answer requires it"


def _dealbreaker_reason_ar(key: str, product_value: bool, signal_value: bool) -> str:
    labels = {
        "needs_car_boot": "مساحة شنطة السيارة",
        "needs_large_basket": "سلة كبيرة",
        "needs_full_recline": "استلقاء كامل",
        "hypoallergenic_required": "حليب مخصص للحساسية",
        "breastfed_only": "طريقة الرضاعة الحالية",
        "video_required": "مراقبة بالفيديو",
        "audio_only_preferred": "مراقبة صوتية فقط",
        "newborn_required": "مرحلة عمر الطفل",
        "isofix_required": "تركيب آيزوفكس",
        "easy_install_required": "سهولة التركيب",
        "back_support_required": "دعم الظهر",
    }
    label = labels.get(key, key.replace("_", " "))
    if product_value:
        return f"يحتاج {label}، وهذا ما يناسب إجاباتك"
    return f"ما يدعم {label}، وإجاباتك تحتاجه"


def _score_product(product: dict, signals: dict) -> dict:
    ideal_for = product.get("ideal_for", [])
    matched_ideal_for = [
        tag for tag in ideal_for
        if signals.get(tag) is True or tag in signals.values()
    ]
    lifestyle_score = (len(matched_ideal_for) / len(ideal_for)) * 40 if ideal_for else 0

    max_price_aed = signals.get("max_price_aed", 999999)
    price = product.get("price_aed", 0)
    if price <= max_price_aed * 0.7:
        budget_score = 30
    elif price <= max_price_aed:
        budget_score = 20
    elif price <= max_price_aed * 1.1:
        budget_score = 5
    else:
        budget_score = 0

    total_reviews = product.get("review_signal", {}).get("total_reviews", 0)
    if total_reviews >= 50:
        review_score = 20
    elif total_reviews >= 20:
        review_score = 12
    elif total_reviews >= 5:
        review_score = 6
    else:
        review_score = 0

    tags = product.get("tags", [])
    specs = product.get("specs", {})
    tag_bonus = 0
    if signals.get("ultra_compact_needed") and "compact" in tags:
        tag_bonus += 5
    if signals.get("weight_sensitive") and specs.get("weight_kg", 99) < 7:
        tag_bonus += 5
    if signals.get("full_recline_required") and specs.get("recline") == "full":
        tag_bonus += 3
    tag_bonus = min(tag_bonus, 10)

    return {
        "product": product,
        "score": lifestyle_score + budget_score + review_score + tag_bonus,
        "matched_ideal_for": matched_ideal_for,
        "breakdown": {
            "lifestyle": lifestyle_score,
            "budget": budget_score,
            "reviews": review_score,
            "tag_bonus": tag_bonus,
        },
    }


def _runner_up_reason(winner: dict, runner_up: dict | None) -> str | None:
    if not runner_up:
        return None

    winner_score = winner["score"]
    runner_score = runner_up["score"]
    gap = winner_score - runner_score

    if gap >= 20:
        return (
            f"Scored significantly lower ({runner_score:.0f} vs "
            f"{winner_score:.0f}) - weaker lifestyle match"
        )
    if gap >= 10:
        return (
            f"Close second ({runner_score:.0f} vs {winner_score:.0f}) "
            f"- slightly over budget or fewer matched signals"
        )
    return (
        f"Nearly identical score ({runner_score:.0f} vs "
        f"{winner_score:.0f}) - winner had stronger review data"
    )


def _confidence_score(winner: dict, eliminated_products: list[dict], fallback: bool) -> float:
    score = winner["score"]
    product = winner["product"]
    review_count = product.get("review_signal", {}).get("total_reviews", 0)

    confidence = 0.5
    if score > 70:
        confidence += 0.15
    if review_count >= 50:
        confidence += 0.10
    if len(eliminated_products) >= 1:
        confidence += 0.10
    if len(winner["matched_ideal_for"]) >= 2:
        confidence += 0.08
    if fallback:
        confidence -= 0.10
    if review_count < 10:
        confidence -= 0.08
    if score < 50:
        confidence -= 0.05

    return round(max(0.30, min(0.95, confidence)), 2)

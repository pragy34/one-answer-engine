SIGNAL_LABELS = {
    "transport": {
        "walk": "mostly walks or uses public transport",
        "car": "travels mostly by car",
        "mixed": "uses both car and walking",
    },
    "space": {
        "constrained": "lives in a compact space",
        "ample": "has ample space at home",
    },
    "budget_tier": {
        "low": "budget under AED 500",
        "mid": "budget AED 500–1500",
        "high": "flexible budget above AED 1500",
    },
    "baby_age_months": lambda v: f"baby is {v} months old",
    "allergy_history": {True: "has allergy history — hypoallergenic needed"},
    "hypoallergenic_required": {True: "hypoallergenic formula required"},
    "full_recline_required": {True: "full recline needed for newborn"},
    "ultra_compact_needed": {True: "needs ultra-compact design"},
    "weight_sensitive": {True: "needs lightweight product"},
}


def humanize_signals(signals: dict) -> list[str]:
    readable = []
    for key, val in signals.items():
        if key not in SIGNAL_LABELS:
            continue
        label = SIGNAL_LABELS[key]
        if callable(label):
            readable.append(label(val))
        elif isinstance(label, dict) and val in label:
            readable.append(label[val])
    return readable if readable else ["your lifestyle preferences"]

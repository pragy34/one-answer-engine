def extract_signals(answers: list[dict]) -> dict:
    signals = {}
    
    for ans in answers:
        if "signal" in ans:
            signals.update(ans["signal"])
            
    if signals.get("transport") == "walk" and signals.get("space") == "constrained":
        signals["ultra_compact_needed"] = True
    if signals.get("must_carry") == True:
        signals["weight_sensitive"] = True
    if signals.get("budget_tier") == "low" and signals.get("space") == "ample":
        signals["value_focus"] = True
    if signals.get("baby_age_months", 99) <= 3:
        signals["full_recline_required"] = True
    if signals.get("allergy_history") == True:
        signals["hypoallergenic_required"] = True
        
    return signals
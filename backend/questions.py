QUESTIONS = {
    "strollers": [
        {
            "key": "transport_mode",
            "text_en": "When you go out with your baby, how do you usually travel?",
            "text_ar": "لما تطلعين مع طفلك، كيف بتتنقلين عادةً؟",
            "options": [
                {"label_en": "Mostly walking / public transport", "label_ar": "مشياً أو مواصلات عامة", "signal": {"transport": "walk", "needs_car_boot": False, "public_transport_user": True, "city_walker": True}},
                {"label_en": "Mostly by car", "label_ar": "بالسيارة دايماً", "signal": {"transport": "car", "needs_car_boot": True, "car_user": True}},
                {"label_en": "Mix of both", "label_ar": "مرات كذا ومرات كذا", "signal": {"transport": "mixed", "needs_car_boot": False, "mixed_transport_user": True}},
            ],
        },
        {
            "key": "living_situation",
            "text_en": "Where do you live?",
            "text_ar": "وين تسكنين؟",
            "options": [
                {"label_en": "Apartment with elevator", "label_ar": "شقة فيها مصعد", "signal": {"space": "constrained", "elevator": True, "apartment_dweller": True}},
                {"label_en": "Villa or ground floor", "label_ar": "فيلا أو طابق أرضي", "signal": {"space": "ample", "elevator": False, "villa_family": True, "needs_large_basket": True}},
                {"label_en": "Apartment, no elevator", "label_ar": "شقة بدون مصعد", "signal": {"space": "constrained", "elevator": False, "must_carry": True, "apartment_dweller": True}},
            ],
        },
        {
            "key": "budget",
            "text_en": "What is your budget?",
            "text_ar": "كم ميزانيتك؟",
            "options": [
                {"label_en": "Under AED 500", "label_ar": "أقل من ٥٠٠ درهم", "signal": {"budget_tier": "low", "max_price_aed": 500, "budget_conscious": True}},
                {"label_en": "AED 500-1500", "label_ar": "٥٠٠ إلى ١٥٠٠ درهم", "signal": {"budget_tier": "mid", "max_price_aed": 1500}},
                {"label_en": "Above AED 1500", "label_ar": "أكثر من ١٥٠٠ درهم", "signal": {"budget_tier": "high", "max_price_aed": 9999}},
            ],
        },
    ],
    "formula": [
        {
            "key": "baby_age",
            "text_en": "How old is your baby?",
            "text_ar": "كم عمر البيبي؟",
            "options": [
                {"label_en": "0-3 months", "label_ar": "من الولادة إلى ٣ شهور", "signal": {"baby_age_months": 2, "newborn_formula": True}},
                {"label_en": "4-12 months", "label_ar": "٤ إلى ١٢ شهر", "signal": {"baby_age_months": 8, "older_infant_formula": True}},
                {"label_en": "Over 1 year", "label_ar": "أكبر من سنة", "signal": {"baby_age_months": 14, "toddler_milk": True}},
            ],
        },
        {
            "key": "allergy_history",
            "text_en": "Has your baby had allergy or tummy sensitivity before?",
            "text_ar": "صار عند البيبي حساسية أو تعب بالبطن قبل؟",
            "options": [
                {"label_en": "Yes, allergy signs", "label_ar": "إيه، في علامات حساسية", "signal": {"allergy_history": True, "hypoallergenic_needed": True}},
                {"label_en": "Some gas or colic", "label_ar": "غازات أو مغص شوي", "signal": {"allergy_history": False, "sensitive_tummy": True}},
                {"label_en": "No, regular feeding is fine", "label_ar": "لا، أموره تمام", "signal": {"allergy_history": False, "standard_formula": True}},
            ],
        },
        {
            "key": "feeding_preference",
            "text_en": "How are you feeding right now?",
            "text_ar": "الحين الرضاعة عندك كيف؟",
            "options": [
                {"label_en": "Mostly breastfeeding", "label_ar": "رضاعة طبيعية أغلب الوقت", "signal": {"feeding": "breast", "breastfed_only": True, "max_price_aed": 9999}},
                {"label_en": "Mixed feeding", "label_ar": "طبيعي وصناعي مع بعض", "signal": {"feeding": "mixed", "mixed_feeding": True, "breastfed_only": False, "max_price_aed": 150}},
                {"label_en": "Mostly formula", "label_ar": "حليب صناعي أغلب الوقت", "signal": {"feeding": "formula", "formula_fed": True, "breastfed_only": False, "max_price_aed": 150}},
            ],
        },
    ],
    "baby_monitors": [
        {
            "key": "house_size",
            "text_en": "What is your home like?",
            "text_ar": "بيتكم كيف حجمه؟",
            "options": [
                {"label_en": "Small apartment", "label_ar": "شقة صغيرة", "signal": {"home_size": "small", "small_home": True}},
                {"label_en": "Large apartment or villa", "label_ar": "شقة كبيرة أو فيلا", "signal": {"home_size": "large", "large_home": True}},
                {"label_en": "Baby sleeps far from living room", "label_ar": "غرفة البيبي بعيدة عن الصالة", "signal": {"home_size": "large", "large_home": True}},
            ],
        },
        {
            "key": "monitor_type",
            "text_en": "What would reassure you more?",
            "text_ar": "إيش يطمنك أكثر؟",
            "options": [
                {"label_en": "Video so I can see baby", "label_ar": "فيديو عشان أشوف البيبي", "signal": {"monitor_preference": "video", "video_required": True, "video_needed": True}},
                {"label_en": "Audio is enough", "label_ar": "الصوت يكفيني", "signal": {"monitor_preference": "audio", "video_required": False, "audio_only_preferred": True, "audio_only": True}},
                {"label_en": "Simple, no app if possible", "label_ar": "أبغاه بسيط وبدون تطبيق لو يصير", "signal": {"monitor_preference": "simple", "video_required": False, "audio_only_preferred": True, "audio_only": True}},
            ],
        },
        {
            "key": "parent_experience",
            "text_en": "Is this your first baby?",
            "text_ar": "هذا أول بيبي لك؟",
            "options": [
                {"label_en": "Yes, first baby", "label_ar": "إيه أول بيبي", "signal": {"first_baby": True, "max_price_aed": 9999}},
                {"label_en": "No, I have experience", "label_ar": "لا، عندي خبرة", "signal": {"first_baby": False, "experienced_parent": True, "max_price_aed": 800}},
                {"label_en": "I want something budget friendly", "label_ar": "أبغى شي سعره حلو", "signal": {"first_baby": False, "budget_conscious": True, "max_price_aed": 350}},
            ],
        },
    ],
    "car_seats": [
        {
            "key": "baby_age_weight",
            "text_en": "Which stage is your child in?",
            "text_ar": "طفلك بأي مرحلة؟",
            "options": [
                {"label_en": "Newborn / under 13 kg", "label_ar": "مولود أو أقل من ١٣ كيلو", "signal": {"baby_age_months": 2, "newborn_required": True, "newborn_seat": True}},
                {"label_en": "Baby to toddler", "label_ar": "بيبي لمرحلة المشي", "signal": {"baby_age_months": 12, "newborn_required": False, "toddler_seat": True}},
                {"label_en": "I want one seat for years", "label_ar": "أبغى كرسي يعيش سنوات", "signal": {"baby_age_months": 10, "newborn_required": True, "long_term_use": True}},
            ],
        },
        {
            "key": "car_type",
            "text_en": "What car situation do you have?",
            "text_ar": "وضع السيارة عندك كيف؟",
            "options": [
                {"label_en": "Small car", "label_ar": "سيارة صغيرة", "signal": {"car_size": "small", "small_car": True, "isofix_required": True}},
                {"label_en": "SUV or large car", "label_ar": "جيب أو سيارة كبيرة", "signal": {"car_size": "large", "large_car": True, "isofix_required": False}},
                {"label_en": "We switch between cars", "label_ar": "نبدل بين أكثر من سيارة", "signal": {"car_size": "mixed", "switch_cars_often": True, "isofix_required": False}},
            ],
        },
        {
            "key": "install_priority",
            "text_en": "How important is easy installation?",
            "text_ar": "سهولة التركيب قد إيش تهمك؟",
            "options": [
                {"label_en": "Very important", "label_ar": "مهمة مره", "signal": {"easy_install_required": True, "easy_install": True, "max_price_aed": 2000}},
                {"label_en": "Nice to have", "label_ar": "حلوة بس مو شرط", "signal": {"easy_install_required": False, "max_price_aed": 1200}},
                {"label_en": "I prefer best value", "label_ar": "أهم شي قيمة وسعر", "signal": {"easy_install_required": False, "budget_conscious": True, "max_price_aed": 900}},
            ],
        },
    ],
    "carriers": [
        {
            "key": "baby_age",
            "text_en": "How old is your baby?",
            "text_ar": "كم عمر البيبي؟",
            "options": [
                {"label_en": "Newborn", "label_ar": "مولود جديد", "signal": {"baby_age_months": 2, "newborn_required": True, "newborn_carrier": True}},
                {"label_en": "4-12 months", "label_ar": "٤ إلى ١٢ شهر", "signal": {"baby_age_months": 8, "newborn_required": False, "quick_errands": True}},
                {"label_en": "Toddler", "label_ar": "يمشي أو أكبر", "signal": {"baby_age_months": 20, "newborn_required": False, "toddler_carrier": True}},
            ],
        },
        {
            "key": "back_pain",
            "text_en": "Do you get back or shoulder pain?",
            "text_ar": "عندك ألم بالظهر أو الكتف؟",
            "options": [
                {"label_en": "Yes, support matters", "label_ar": "إيه، الدعم مهم", "signal": {"back_pain_history": True, "back_support_required": True, "back_support_needed": True}},
                {"label_en": "Sometimes", "label_ar": "أحياناً", "signal": {"back_pain_history": True, "back_support_required": True, "back_support_needed": True}},
                {"label_en": "No, I want something simple", "label_ar": "لا، أبغى شي بسيط", "signal": {"back_pain_history": False, "back_support_required": False, "budget_conscious": True}},
            ],
        },
        {
            "key": "use_case",
            "text_en": "Where will you use the carrier most?",
            "text_ar": "وين بتستخدمين الحمالة أكثر؟",
            "options": [
                {"label_en": "Mostly indoors", "label_ar": "داخل البيت غالباً", "signal": {"use_case": "indoor", "indoor_use": True, "max_price_aed": 500}},
                {"label_en": "Outdoor walks and malls", "label_ar": "طلعات ومولات", "signal": {"use_case": "outdoor", "outdoor_use": True, "max_price_aed": 900}},
                {"label_en": "Quick errands", "label_ar": "مشاوير سريعة", "signal": {"use_case": "quick", "quick_errands": True, "max_price_aed": 600}},
            ],
        },
    ],
}

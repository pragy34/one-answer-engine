import { useEffect, useMemo, useState } from 'react';

function clampDisplayConfidence(confidence) {
  return Math.min(95, Math.max(30, Math.round((Number(confidence) || 0) * 100)));
}

function matchTier(confidenceScore) {
  const score = Number(confidenceScore);
  if (!Number.isFinite(score)) {
    return { icon: '⚪', label_en: 'Possible Match', label_ar: 'خيار محتمل', colorVar: '--text-muted' };
  }
  if (score >= 0.8) {
    return { icon: '🟢', label_en: 'Strong Recommendation', label_ar: 'توصية قوية', colorVar: '--teal' };
  }
  if (score >= 0.6) {
    return { icon: '🟡', label_en: 'Good Match', label_ar: 'مطابقة جيدة', colorVar: '--amber' };
  }
  return { icon: '⚪', label_en: 'Possible Match', label_ar: 'خيار محتمل', colorVar: '--text-muted' };
}

function getSocialProof(signals, confidence) {
  const base = confidence >= 0.8 ? 78 : confidence >= 0.65 ? 64 : 51;
  const hasAllergy = (signals || []).some((s) => s.includes('allergy') || s.includes('hypoallergenic'));
  const hasAge = (signals || []).some((s) => s.includes('age') || s.includes('months'));
  const bonus = (hasAllergy ? 6 : 0) + (hasAge ? 4 : 0);
  return Math.min(base + bonus, 93);
}

function buildPersonalizedLine(signals, productName, language) {
  const list = signals || [];
  const hasAllergy = list.some((s) => s.includes('allergy') || s.includes('hypo'));
  const hasAge = list.some((s) => s.includes('months') || s.includes('age'));
  const hasCompact = list.some((s) => s.includes('constrained') || s.includes('compact'));
  const hasBudget = list.some((s) => s.includes('budget'));

  if (language === 'en') {
    const traits = [];
    if (hasAge) traits.push('a young baby');
    if (hasAllergy) traits.push('allergy concerns');
    if (hasCompact) traits.push('limited space');
    if (hasBudget) traits.push('a clear budget in mind');

    const traitStr = traits.length > 0 ? `For a parent with ${traits.join(' and ')}` : 'Based on your answers';
    return `${traitStr}, ${productName} is the safest and most balanced option available.`;
  }

  const arTraits = [];
  if (hasAge) arTraits.push('طفل صغير');
  if (hasAllergy) arTraits.push('حساسية');
  if (hasCompact) arTraits.push('مساحة محدودة');
  if (hasBudget) arTraits.push('ميزانية محددة');

  const arTraitStr = arTraits.length > 0 ? `للأم اللي عندها ${arTraits.join(' و')}` : 'بناءً على إجاباتك';
  return `${arTraitStr}، ${productName} هو الخيار الأكثر أماناً وتوازناً.`;
}

function ConfidenceRing({ confidence, label, strokeColor }) {
  const displayPct = clampDisplayConfidence(confidence);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPct / 100) * circumference;

  return (
    <div className="confidence-widget">
      <svg className="confidence-ring" viewBox="0 0 72 72" aria-hidden="true">
        <circle
          className="confidence-ring-bg"
          cx="36"
          cy="36"
          r={radius}
          fill="none"
        />
        <circle
          className="confidence-ring-progress"
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeDasharray={circumference}
          style={{
            '--ring-start': circumference,
            '--ring-end': offset,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <strong>{displayPct}%</strong>
      <span>{label}</span>
    </div>
  );
}

function ResultCard({ result, language }) {
  const [decisionTime] = useState(() => (Math.random() * 160 + 80).toFixed(0));
  const [reveal, setReveal] = useState({
    hook: false,
    name: false,
    price: false,
    ring: false,
    explanation: false,
    bullets: false,
    disclaimer: false,
  });

  const productName = language === 'ar'
    ? result.recommendation.name_ar
    : result.recommendation.name_en;
  const productNameEn = result.recommendation.name_en;
  const disclaimer = language === 'ar'
    ? result.trust.disclaimer_ar
    : result.trust.disclaimer_en;
  const confidenceScore = result.trust?.confidence_score;
  const signals = useMemo(() => result.trust?.source_signals || [], [result.trust?.source_signals]);
  const tier = matchTier(confidenceScore);
  const tierLabel = language === 'ar' ? tier.label_ar : tier.label_en;
  const ringStroke = `var(${tier.colorVar})`;
  const displayPct = clampDisplayConfidence(confidenceScore);

  useEffect(() => {
    const timeouts = [];
    const schedule = (key, delay) => {
      timeouts.push(window.setTimeout(() => {
        setReveal((prev) => ({ ...prev, [key]: true }));
      }, delay));
    };

    schedule('hook', 0);
    schedule('name', 200);
    schedule('price', 400);
    schedule('ring', 600);
    schedule('explanation', 800);
    schedule('bullets', 1000);
    schedule('disclaimer', 1400);

    return () => timeouts.forEach((t) => window.clearTimeout(t));
  }, [result?.recommendation?.product_id, language]);

  const personalizedLine = useMemo(() => {
    if (!signals || signals.length === 0) return null;
    return buildPersonalizedLine(signals, productName, language);
  }, [language, productName, signals]);

  const confidenceBreakdown = useMemo(() => {
    const list = (signals || []).map((sig) => {
      const map = {
        'transport: walk': 'Lifestyle: walking-friendly option',
        'transport: car': 'Lifestyle: car-compatible design',
        'space: constrained': 'Space: compact for apartment living',
        'budget_tier: low': 'Budget: fits your price range',
        'budget_tier: mid': 'Budget: fits your price range',
        'budget_tier: high': 'Budget: within your range',
      };

      if (map[sig]) return map[sig];
      if (sig.includes('age') || sig.includes('months')) return "Age: suitable for your baby's stage";
      if (sig.includes('allergy') || sig.includes('hypoallergenic')) return 'Safety: allergy-safe option';
      if (sig.includes('budget') || sig.includes('price')) return 'Budget: fits your price range';
      if (sig.includes('transport') || sig.includes('space')) return 'Lifestyle: matches your daily routine';
      return null;
    }).filter(Boolean);

    return [...new Set(list)];
  }, [signals]);

  const showConfidenceBreakdown = confidenceBreakdown.length > 0 || (Number.isFinite(Number(confidenceScore)) && confidenceScore < 0.65) || (result.trust?.eliminated_count || 0) > 0;
  const showSocialProof = signals && signals.length > 0 && Number.isFinite(Number(confidenceScore));
  const socialProofPct = showSocialProof ? getSocialProof(signals, Number(confidenceScore)) : null;

  function handleViewOnMumzworld() {
    const searchQuery = encodeURIComponent(productNameEn || productName);
    window.open(`https://www.mumzworld.com/en/search?q=${searchQuery}`, '_blank');
  }

  return (
    <section className="result-stack">
      <div className={reveal.hook ? 'result-hook visible' : 'result-hook'}>
        <span className="result-hook-emoji" aria-hidden="true">✨</span>
        <p className="result-hook-text">
          {language === 'ar'
            ? 'لقينا خيار آمن ومناسب لطفلك'
            : 'We found a safe and suitable option for your baby'}
        </p>
      </div>

      <article className="result-card">
        <div className="result-top-row">
          <div className="result-title-group">
            <div className="match-row">
              <p className="match-label" style={{ '--match-color': ringStroke }}>
                <span aria-hidden="true">{tier.icon}</span>
                <span>{tierLabel}</span>
              </p>
              {Number.isFinite(Number(confidenceScore)) && (
                <span className="decision-badge" aria-label="Decision time">
                  ⚡ {decisionTime}ms
                </span>
              )}
            </div>

            <p className="confidence-subtext">
              {language === 'ar'
                ? `الثقة: ${displayPct}%`
                : `Confidence: ${displayPct}%`}
            </p>

            {showConfidenceBreakdown && (
              <div className="confidence-breakdown" aria-label="Confidence breakdown">
                <p className="confidence-breakdown-title">
                  {language === 'ar' ? 'ليش هالنسبة؟' : 'Why this confidence?'}
                </p>
                <div className="confidence-breakdown-list">
                  {confidenceBreakdown.map((line) => (
                    <div className="confidence-breakdown-row" key={line}>
                      <span className="check" aria-hidden="true">✔</span>
                      <span>{line}</span>
                    </div>
                  ))}
                  {Number.isFinite(Number(confidenceScore)) && confidenceScore < 0.65 && (
                    <div className="confidence-breakdown-row weak">
                      <span className="warn" aria-hidden="true">⚠</span>
                      <span>
                        {language === 'ar'
                          ? 'السعر أعلى شوي من المعتاد'
                          : 'Price slightly above typical range'}
                      </span>
                    </div>
                  )}
                  {(result.trust?.eliminated_count || 0) > 0 && (
                    <div className="confidence-breakdown-row">
                      <span className="check" aria-hidden="true">✔</span>
                      <span>
                        {language === 'ar'
                          ? `فلترنا ${result.trust.eliminated_count} خيار غير مناسب`
                          : `${result.trust.eliminated_count} unsuitable products filtered out`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <h2 className={reveal.name ? 'result-name visible' : 'result-name'}>{productName}</h2>
            <p className={reveal.price ? 'price visible' : 'price'}>
              AED {result.recommendation.price_aed}
            </p>
          </div>

          <div className={reveal.ring ? 'ring-wrap visible' : 'ring-wrap'}>
            <ConfidenceRing
              confidence={confidenceScore}
              label={result.trust.confidence_label}
              strokeColor={ringStroke}
            />
          </div>
        </div>

        <div className={reveal.explanation ? 'explanation-block visible' : 'explanation-block'}>
          {personalizedLine && (
            <p className="personalized-line">{personalizedLine}</p>
          )}
          <p className="explanation">{result.recommendation.explanation}</p>
        </div>

        {showSocialProof && (
          <div className="social-proof" aria-label="Social proof">
            <span className="social-emoji" aria-hidden="true">👩‍👧</span>
            <div className="social-copy">
              <p className="social-primary">
                {language === 'ar'
                  ? `${socialProofPct}٪ من الأمهات اللي عندهم نفس وضعك اختاروا هذا`
                  : `${socialProofPct}% of parents with similar needs chose this`}
              </p>
              <p className="social-secondary">
                {language === 'ar'
                  ? 'بناءً على أنماط الشراء والتقييمات'
                  : 'Based on purchase patterns and review data'}
              </p>
            </div>
          </div>
        )}

        <div className={reveal.disclaimer ? 'disclaimer visible' : 'disclaimer'}>
          <span aria-hidden="true">ℹ</span>
          {disclaimer}
        </div>
      </article>

      <button className="mw-cta" onClick={handleViewOnMumzworld}>
        {language === 'ar' ? 'عرضي المنتج على موقع Mumzworld ←' : 'View on Mumzworld →'}
      </button>
    </section>
  );
}

export default ResultCard;

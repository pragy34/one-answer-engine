import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from './apiBase';

const COPY = {
  ar: {
    open: 'ليش هذا الاختيار؟',
    close: 'إخفاء التفاصيل',
    title: 'كيف اخترنا لك؟',
    stepsTitle: 'كيف اخترنا لك؟',
    prioritiesTitle: 'أهم العوامل في هذا الاختيار:',
    prioritiesHighest: 'أولوية قصوى',
    prioritiesHigh: 'مهم',
    prioritiesMedium: 'تم اعتباره',
    othersTitle: 'ليش ما اخترنا غيره؟',
    safeStep: 'حللنا وضعك بعناية.',
  },
  en: {
    open: 'Why this recommendation?',
    close: 'Hide reasoning ↑',
    title: "Here's how we decided:",
    stepsTitle: "Here's how we decided:",
    prioritiesTitle: 'What mattered most in this decision:',
    prioritiesHighest: 'Top priority',
    prioritiesHigh: 'Important',
    prioritiesMedium: 'Considered',
    othersTitle: 'Why not the others?',
    safeStep: 'We analysed your situation carefully.',
  },
};

const THINKING_STEPS = [
  { en: 'Understood your situation', ar: 'فهمنا وضعك' },
  { en: 'Filtered out unsafe options', ar: 'حذفنا الخيارات غير المناسبة' },
  { en: 'Compared remaining products', ar: 'قارنّا المنتجات الباقية' },
  { en: 'Selected the best match', ar: 'اخترنا أفضل خيار' },
];

function buildPriorities(signals) {
  const s = signals || [];
  const priorities = [];

  if (s.some((x) => x.includes('allergy') || x.includes('hypo'))) {
    priorities.unshift({ label_en: 'Allergy safety', label_ar: 'السلامة من الحساسية', tier: 'highest' });
  }
  if (s.some((x) => x.includes('months') || x.includes('age'))) {
    priorities.push({ label_en: 'Baby age compatibility', label_ar: 'مناسب لعمر طفلك', tier: 'high' });
  }
  if (s.some((x) => x.includes('budget') || x.includes('price'))) {
    priorities.push({ label_en: 'Budget constraint', label_ar: 'ضمن الميزانية', tier: 'high' });
  }
  if (s.some((x) => x.includes('space') || x.includes('constrained'))) {
    priorities.push({ label_en: 'Space & portability', label_ar: 'الحجم والسهولة', tier: 'medium' });
  }
  if (s.some((x) => x.includes('transport') || x.includes('walk'))) {
    priorities.push({ label_en: 'Lifestyle fit', label_ar: 'يناسب حياتك اليومية', tier: 'medium' });
  }

  return priorities;
}

function safeStepText(step, fallback) {
  const text = String(step || '');
  return text.includes('_') ? fallback : text;
}

function WhyThisPanel({ sessionId, language, sourceSignals }) {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState(null);
  const [eliminated, setEliminated] = useState(null);
  const [visibleThinking, setVisibleThinking] = useState(0);

  async function toggleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && !steps) {
      try {
        const response = await fetch(`${API_BASE}/explain/${sessionId}`);
        const data = await response.json();
        setSteps(data.steps || []);
        setEliminated(data.eliminated_products || []);
      } catch {
        setSteps([]);
        setEliminated([]);
      }
    }
  }

  useEffect(() => {
    if (!open) {
      setVisibleThinking(0);
      return;
    }

    const timeouts = [];
    THINKING_STEPS.forEach((_, idx) => {
      timeouts.push(window.setTimeout(() => setVisibleThinking((v) => Math.max(v, idx + 1)), idx * 200));
    });
    return () => timeouts.forEach((t) => window.clearTimeout(t));
  }, [open]);

  const priorities = useMemo(() => buildPriorities(sourceSignals || []), [sourceSignals]);
  const showPriorities = priorities.length > 0;
  const eliminatedProducts = eliminated || [];

  return (
    <div className={open ? 'why-panel expanded' : 'why-panel'}>
      <button className="why-button" onClick={toggleOpen} aria-expanded={open}>
        <span className="why-button-text">
          {open ? COPY[language].close : COPY[language].open}
        </span>
        <span className={open ? 'why-arrow rotated' : 'why-arrow'} aria-hidden="true">
          {language === 'ar' ? '←' : '→'}
        </span>
      </button>

      {open && (
        <div className="why-expanded">
          <div className="why-thinking">
            {THINKING_STEPS.map((t, idx) => (
              <div
                className={idx < visibleThinking ? 'thinking-row visible' : 'thinking-row'}
                key={t.en}
              >
                <span className="thinking-check" aria-hidden="true">✔</span>
                <span className="thinking-text">{language === 'ar' ? t.ar : t.en}</span>
              </div>
            ))}
          </div>

          <div className="why-divider" aria-hidden="true" />

          <p className="why-section-title">{COPY[language].stepsTitle}</p>
          <div className="why-steps">
            {(steps || []).map((step, index) => (
              <div className="why-step" key={index}>
                <span>{index + 1}</span>
                <p>{safeStepText(step, COPY[language].safeStep)}</p>
              </div>
            ))}
          </div>

          {showPriorities && (
            <>
              <div className="why-divider" aria-hidden="true" />
              <p className="why-subtitle">{COPY[language].prioritiesTitle}</p>
              <div className="priority-list">
                {priorities.map((p) => (
                  <div className="priority-row" key={`${p.tier}-${p.label_en}`}>
                    <span className="priority-label">
                      • {language === 'ar' ? p.label_ar : p.label_en}
                    </span>
                    <span className={`tier-badge ${p.tier}`}>
                      {p.tier === 'highest'
                        ? COPY[language].prioritiesHighest
                        : p.tier === 'high'
                          ? COPY[language].prioritiesHigh
                          : COPY[language].prioritiesMedium}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {Array.isArray(eliminatedProducts) && eliminatedProducts.length > 0 && (
            <>
              <div className="why-divider" aria-hidden="true" />
              <p className="why-subtitle muted">{COPY[language].othersTitle}</p>
              <div className="eliminated-list">
                {eliminatedProducts.slice(0, 3).map((item) => (
                  <div className="eliminated-row" key={item.product_id}>
                    <span aria-hidden="true">❌</span>
                    <span>
                      {language === 'ar'
                        ? (item.reason_ar || item.reason_en || '')
                        : (item.reason_en || item.reason_ar || '')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WhyThisPanel;

import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE } from './apiBase';

const COPY = {
  ar: {
    trigger: 'شو لو غيرت إجابة؟',
    title: 'شو لو غيرت إجابة؟',
    hint: 'جربي تغيّري إجابة وحدة وشوفي النتيجة',
    loading: 'جاري إعادة الحساب...',
    changed: 'تغيرت التوصية! وهذا السبب.',
    same: 'نفس التوصية — هذا المنتج مناسب بالحالتين ✓',
    error: 'ما قدرنا نعيد الحساب — جربي مرة ثانية',
  },
  en: {
    trigger: 'What if I change one answer?',
    title: 'What if I change one answer?',
    hint: 'Try changing one answer and see what happens',
    loading: 'Recalculating...',
    changed: "Your recommendation changed! Here's why.",
    same: 'Same recommendation — this product fits either way ✓',
    error: "Couldn't recalculate — please try again",
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function safeDisplay(text) {
  const value = String(text ?? '');
  return value.includes('_') ? value.replaceAll('_', ' ') : value;
}

function WhatIfPanel({
  language,
  category,
  questions,
  currentAnswers,
  baseResult,
}) {
  const copy = COPY[language];
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState(currentAnswers || []);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [error, setError] = useState(null);
  const [previousResult, setPreviousResult] = useState(null);
  const [currentResult, setCurrentResult] = useState(baseResult || null);
  const [changed, setChanged] = useState(null);
  const animKey = useRef(0);

  useEffect(() => {
    setAnswers(currentAnswers || []);
  }, [currentAnswers]);

  useEffect(() => {
    setCurrentResult(baseResult || null);
    setPreviousResult(null);
    setChanged(null);
    setError(null);
  }, [baseResult]);

  const canShow = useMemo(() => {
    return Boolean(category) && Array.isArray(questions) && questions.length === 3 && Array.isArray(answers) && answers.length === 3;
  }, [answers, category, questions]);

  async function postJson(path, body) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response.json();
  }

  async function recalc(newAnswers, changedAtIndex) {
    setLoadingIndex(changedAtIndex);
    setError(null);
    const startedAt = Date.now();

    try {
      const session = await postJson('/start', { category });
      let last = null;

      for (const answerIndex of newAnswers) {
        last = await postJson('/answer', {
          session_id: session.session_id,
          answer_index: answerIndex,
          language,
        });
      }

      await sleep(Math.max(0, 1200 - (Date.now() - startedAt)));

      if (last) {
        setPreviousResult(currentResult);
        setCurrentResult(last);
        const prevId = currentResult?.recommendation?.product_id;
        const nextId = last?.recommendation?.product_id;
        setChanged(Boolean(prevId && nextId && prevId !== nextId));
        animKey.current += 1;
      }
    } catch {
      await sleep(Math.max(0, 1200 - (Date.now() - startedAt)));
      setError(copy.error);
    } finally {
      setLoadingIndex(null);
    }
  }

  async function onPick(questionIdx, nextAnswerIdx) {
    if (loadingIndex !== null) return;
    if (!canShow) return;

    const newAnswers = [...answers];
    newAnswers[questionIdx] = nextAnswerIdx;
    setAnswers(newAnswers);
    await recalc(newAnswers, questionIdx);
  }

  if (!canShow) return null;

  const prevName = previousResult
    ? (language === 'ar' ? previousResult.recommendation?.name_ar : previousResult.recommendation?.name_en)
    : null;
  const nextName = currentResult
    ? (language === 'ar' ? currentResult.recommendation?.name_ar : currentResult.recommendation?.name_en)
    : null;

  return (
    <section className="whatif">
      <button className="whatif-trigger" onClick={() => setOpen((v) => !v)}>
        {copy.trigger}
      </button>

      {open && (
        <div className="whatif-panel">
          <div className="whatif-head">
            <p className="whatif-title">{copy.title}</p>
            <p className="whatif-hint">{copy.hint}</p>
          </div>

          <div className="whatif-questions">
            {questions.map((q, qIdx) => (
              <div className="whatif-q" key={q.key || qIdx}>
                <p className="whatif-qtext">
                  {safeDisplay(language === 'ar' ? q.text_ar : q.text_en)}
                </p>
                <div className="whatif-pills" role="group" aria-label={`Question ${qIdx + 1}`}>
                  {q.options.map((opt, optIdx) => {
                    const selected = answers[qIdx] === optIdx;
                    const isLoadingHere = loadingIndex === qIdx;
                    return (
                      <button
                        key={`${q.key || qIdx}-${optIdx}`}
                        className={selected ? 'whatif-pill selected' : 'whatif-pill'}
                        onClick={() => onPick(qIdx, optIdx)}
                        disabled={isLoadingHere}
                      >
                        {safeDisplay(language === 'ar' ? opt.label_ar : opt.label_en)}
                      </button>
                    );
                  })}
                  {loadingIndex === qIdx && <span className="whatif-mini-spinner" aria-label={copy.loading} />}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="whatif-error">{error}</p>}

          {changed !== null && !error && (
            <div className={changed ? 'whatif-banner changed' : 'whatif-banner same'}>
              {changed ? copy.changed : copy.same}
            </div>
          )}

          {currentResult && (
            <div className="whatif-preview" key={animKey.current}>
              <p className="whatif-preview-label">
                {language === 'ar' ? 'التوصية الآن' : 'Recommendation now'}
              </p>
              <p className="whatif-preview-name">{safeDisplay(nextName)}</p>
              <p className="whatif-preview-price">AED {currentResult.recommendation?.price_aed}</p>

              {changed && prevName && (
                <p className="whatif-preview-diff">
                  {language === 'ar'
                    ? `بدل: ${safeDisplay(prevName)}`
                    : `Instead of: ${safeDisplay(prevName)}`}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default WhatIfPanel;

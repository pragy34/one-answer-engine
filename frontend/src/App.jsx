import { useEffect, useRef, useState } from 'react';
import './App.css';
import CategoryPicker from './CategoryPicker';
import QuestionFlow from './QuestionFlow';
import ResultCard from './ResultCard';
import RunnerUpCard from './RunnerUpCard';
import WhyThisPanel from './WhyThisPanel';
import WhatIfPanel from './WhatIfPanel';

const API_BASE_RAW = import.meta?.env?.VITE_API_BASE;
// If VITE_API_BASE is set to an empty string, we intentionally use same-origin ("" + "/path").
const API_BASE =
  typeof API_BASE_RAW === 'string' ? API_BASE_RAW.trim() : 'http://127.0.0.1:8000';

const COPY = {
  ar: {
    brand: '✦ One Answer Engine',
    language: 'English',
    loading: 'جاري التفكير...',
    loadingDetail: 'بنحلل إجاباتك',
    error: 'في مشكلة بسيطة، حاولي مرة ثانية',
    again: 'اختيار فئة ثانية',
  },
  en: {
    brand: '✦ One Answer Engine',
    language: 'العربية',
    loading: 'Finding your match...',
    loadingDetail: 'Analysing your answers',
    error: 'Something went wrong. Please try again.',
    again: 'Choose another category',
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const [language, setLanguage] = useState('en');
  const [screen, setScreen] = useState('CATEGORY_SELECT');
  const [sessionId, setSessionId] = useState(null);
  const [category, setCategory] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [result, setResult] = useState(null);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [answerIndices, setAnswerIndices] = useState([]);
  const resultRef = useRef(null);

  const copy = COPY[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (screen === 'RESULT') {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [screen]);

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

  async function selectCategory(category) {
    try {
      const data = await postJson('/start', { category });
      setSessionId(data.session_id);
      setCategory(category);
      setQuestion(data.question || data.next_question);
      setAnsweredCount(0);
      setResult(null);
      setAskedQuestions([]);
      setAnswerIndices([]);
      setScreen('QUESTION_FLOW');
    } catch {
      setScreen('ERROR');
    }
  }

  async function answerQuestion(answerIndex) {
    if (!sessionId || !question) return;

    const isFinalAnswer = answeredCount >= 2;
    const startedAt = Date.now();

    if (isFinalAnswer) {
      setScreen('LOADING');
    }

    setAskedQuestions((prev) => {
      if (prev.length > answeredCount) return prev;
      return [...prev, question];
    });
    setAnswerIndices((prev) => {
      const next = [...prev];
      next[answeredCount] = answerIndex;
      return next;
    });

    try {
      const data = await postJson('/answer', {
        session_id: sessionId,
        answer_index: answerIndex,
        language,
      });

      if (data.next_question) {
        setAnsweredCount((count) => count + 1);
        setQuestion(data.next_question);
        return;
      }

      setAnsweredCount(3);
      await sleep(Math.max(0, 1200 - (Date.now() - startedAt)));
      setResult(data);
      setScreen('RESULT');
    } catch {
      if (isFinalAnswer) {
        await sleep(Math.max(0, 1200 - (Date.now() - startedAt)));
      }
      setScreen('ERROR');
    }
  }

  async function toggleLanguage() {
    const nextLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLanguage);

    if (screen === 'RESULT' && sessionId) {
      try {
        const data = await postJson('/answer', {
          session_id: sessionId,
          language: nextLanguage,
        });
        setResult(data);
      } catch {
        setScreen('ERROR');
      }
    }
  }

  function reset() {
    setScreen('CATEGORY_SELECT');
    setSessionId(null);
    setCategory(null);
    setQuestion(null);
    setAnsweredCount(0);
    setResult(null);
    setAskedQuestions([]);
    setAnswerIndices([]);
  }

  return (
    <div className="app-shell" dir={dir}>
      <header className="app-header">
        <div className="app-container header-inner">
          <div className="brand">{copy.brand}</div>
          <button className="language-toggle" onClick={toggleLanguage}>
            {copy.language}
          </button>
        </div>
      </header>

      <main className="app-container app-main">
        {screen === 'CATEGORY_SELECT' && (
          <CategoryPicker language={language} onSelect={selectCategory} />
        )}

        {screen === 'QUESTION_FLOW' && question && (
          <QuestionFlow
            question={question}
            language={language}
            answeredCount={answeredCount}
            onAnswer={answerQuestion}
          />
        )}

        {screen === 'LOADING' && (
          <section className="loading-screen" aria-live="polite">
            <div className="thinking-orb">
              <span className="spinner" />
            </div>
            <p>{copy.loading}</p>
            <span>{copy.loadingDetail}</span>
          </section>
        )}

        {screen === 'ERROR' && (
          <section className="empty-state">
            <div className="empty-icon">✦</div>
            <p>{copy.error}</p>
            <button className="reset-button" onClick={reset}>
              {copy.again}
            </button>
          </section>
        )}

        {screen === 'RESULT' && result && (
          <section className="result-layout" ref={resultRef}>
            <ResultCard result={result} language={language} />
            <WhyThisPanel
              sessionId={sessionId}
              language={language}
              sourceSignals={result.trust?.source_signals}
            />
            <WhatIfPanel
              language={language}
              category={category}
              questions={askedQuestions}
              currentAnswers={answerIndices}
              baseResult={result}
            />
            <RunnerUpCard runnerUp={result.runner_up} language={language} />
            <button className="reset-button" onClick={reset}>
              {copy.again}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;


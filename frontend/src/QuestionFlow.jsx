import { useEffect, useState } from 'react';

function QuestionFlow({ question, language, answeredCount, onAnswer }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    setSelectedIndex(null);
  }, [question.key]);

  function handleAnswer(index) {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    window.setTimeout(() => onAnswer(index), 140);
  }

  return (
    <section className="question-panel" key={question.key}>
      <div className="progress-dots" aria-label="Progress">
        {[0, 1, 2].map((dot) => (
          <span
            className={dot <= answeredCount ? 'progress-dot filled' : 'progress-dot'}
            key={dot}
          />
        ))}
      </div>

      <div className="question-slide">
        <h2>{language === 'ar' ? question.text_ar : question.text_en}</h2>
        <div className="option-list">
          {question.options.map((option, index) => (
            <button
              className={selectedIndex === index ? 'option-button selected' : 'option-button'}
              key={`${question.key}-${index}`}
              onClick={() => handleAnswer(index)}
            >
              {language === 'ar' ? option.label_ar : option.label_en}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QuestionFlow;

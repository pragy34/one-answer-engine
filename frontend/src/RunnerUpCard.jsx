function RunnerUpCard({ runnerUp, language }) {
  if (!runnerUp) return null;

  const name = language === 'ar' ? runnerUp.name_ar : runnerUp.name_en;

  return (
    <article className="runner-card">
      <p className="runner-label">{language === 'ar' ? 'خيار ثاني' : 'Also consider'}</p>
      <h3>{name}</h3>
      <p className="runner-price">AED {runnerUp.price_aed}</p>
      {runnerUp.why_not_selected && (
        <p className="runner-reason">{runnerUp.why_not_selected}</p>
      )}
    </article>
  );
}

export default RunnerUpCard;

const CATEGORIES = [
  {
    key: 'strollers',
    emoji: '🛺',
    name_ar: 'العريبات',
    name_en: 'Strollers',
    desc_ar: 'لاقي العربية الأنسب لحياتك',
    desc_en: 'Find the right stroller for your lifestyle',
  },
  {
    key: 'formula',
    emoji: '🍼',
    name_ar: 'حليب الأطفال',
    name_en: 'Baby Formula',
    desc_ar: 'الحليب المناسب لاحتياج طفلك',
    desc_en: "The right formula for your baby's needs",
  },
  {
    key: 'baby_monitors',
    emoji: '📡',
    name_ar: 'أجهزة المراقبة',
    name_en: 'Baby Monitors',
    desc_ar: 'خليك دايماً قريبة من طفلك',
    desc_en: 'Stay connected to your baby',
  },
  {
    key: 'car_seats',
    emoji: '🚗',
    name_ar: 'كراسي السيارة',
    name_en: 'Car Seats',
    desc_ar: 'سفر آمن لطفلك الصغير',
    desc_en: 'Safe travels for your little one',
  },
  {
    key: 'carriers',
    emoji: '👶',
    name_ar: 'الحمالات',
    name_en: 'Baby Carriers',
    desc_ar: 'طفلك قريب وإيديك حرة',
    desc_en: 'Keep your baby close, hands free',
  },
];

const COPY = {
  ar: {
    title: 'شوفي الخيار الأنسب لك',
    subtitle: '٣ أسئلة فقط، وجوابك جاهز',
  },
  en: {
    title: 'Find your perfect match',
    subtitle: '3 questions. One clear answer.',
  },
};

function CategoryPicker({ language, onSelect }) {
  const copy = COPY[language];

  return (
    <section className="category-picker" aria-label="Categories">
      <div className="hero-copy">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <button
            className="category-card"
            key={category.key}
            onClick={() => onSelect(category.key)}
          >
            <span className="category-emoji">{category.emoji}</span>
            <span className="category-name">
              {language === 'ar' ? category.name_ar : category.name_en}
            </span>
            <span className="category-desc">
              {language === 'ar' ? category.desc_ar : category.desc_en}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategoryPicker;

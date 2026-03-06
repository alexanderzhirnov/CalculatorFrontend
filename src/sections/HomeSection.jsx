import React, { useEffect, useState } from 'react';

const HERO_IMAGES = ['./media/avel-chuklanov-IB0VA6VdqBw-unsplash.jpg', './media/brett-jordan-PFr50OBMowU-unsplash.jpg', './media/glenov-brankovic-DWp5nUqTn6E-unsplash.jpg'];

const GALLERY_IMAGES = [
  {
    src: './media/scott-blake-wq7oyx_Kx-4-unsplash.jpg',
    title: 'Запустить калькулятор проекта',
    description: 'Быстро рассчитайте каркас и фундамент по параметрам клиента.',
    tab: 'calculator',
    cta: 'К расчётам'
  },
  {
    src: './media/jesse-orrico-L94dWXNKwrY-unsplash.jpg',
    title: 'Открыть каталог материалов',
    description: 'Сверяйте цены, добавляйте позиции в корзину и формируйте смету.',
    tab: 'materials',
    cta: 'К материалам'
  },
  {
    src: './media/pop-zebra-wp81DxKUd1E-unsplash.jpg',
    title: 'Перейти в личный кабинет',
    description: 'Управляйте клиентами, статусами и историей расчётов в одном месте.',
    tab: 'cabinet',
    cta: 'В кабинет'
  }
];

const ANALYTICS_WIDGETS = [
  {
    title: 'Сокращение сроков',
    value: 34,
    subtitle: 'Подготовка сметы и КП быстрее в среднем на 34%',
    description: 'Автогенерация расчётов и шаблонов устраняет рутинные согласования и ускоряет запуск работ.',
    type: 'ring'
  },
  {
    title: 'Экономия бюджета',
    value: 28,
    subtitle: 'Снижение перерасхода материалов до 28%',
    description: 'Сверка норм и фактического расхода на каждом этапе даёт прозрачный контроль бюджета.',
    type: 'bars',
    bars: [38, 52, 63, 78, 91]
  },
  {
    title: 'Точность планирования',
    value: 93,
    subtitle: 'Точность прогноза по ресурсам до 93%',
    description: 'Единая модель проекта позволяет прогнозировать потребности в материалах и работах без ручных таблиц.',
    type: 'line',
    points: '4,76 42,50 78,58 116,30 152,42 190,18'
  },
  {
    title: 'Продуктивность команды',
    value: 41,
    subtitle: 'Рост продуктивности команды до +41%',
    description: 'Все участники проекта работают в общем контуре: меньше звонков, меньше дублей и быстрее решения.',
    type: 'progress',
    segments: [41, 27, 18, 14]
  }
];

export { HERO_IMAGES };

function WidgetVisual({ widget, revealed }) {
  if (widget.type === 'ring') {
    return (
      <div className={`metric-visual ring ${revealed ? 'revealed' : ''}`} style={{ '--progress': widget.value }}>
        <div className="ring-value">{widget.value}%</div>
      </div>
    );
  }

  if (widget.type === 'bars') {
    return (
      <div className="metric-visual bars">
        {widget.bars.map((bar, idx) => (
          <span
            key={`${widget.title}-${bar}`}
            className={revealed ? 'revealed' : ''}
            style={{ '--bar': `${bar}%`, '--delay': `${idx * 110}ms` }}
          />
        ))}
      </div>
    );
  }

  if (widget.type === 'line') {
    return (
      <div className={`metric-visual line ${revealed ? 'revealed' : ''}`}>
        <svg viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={widget.points} />
        </svg>
      </div>
    );
  }

  return (
    <div className="metric-visual progress">
      {widget.segments.map((segment, idx) => (
        <span key={`${widget.title}-segment-${segment}`} className={revealed ? 'revealed' : ''} style={{ '--segment': `${segment}%`, '--delay': `${idx * 120}ms` }} />
      ))}
    </div>
  );
}

export default function HomeSection({ heroIndex, openTab }) {
  const [visibleWidgets, setVisibleWidgets] = useState({});

  useEffect(() => {
    const cards = document.querySelectorAll('.analytics-widget');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleWidgets((prev) => ({ ...prev, [entry.target.dataset.metric]: true }));
          }
        });
      },
      { threshold: 0.35 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="hero-shell">
        <div className="hero-bg" style={{ backgroundImage: `linear-gradient(120deg, rgba(13,14,18,.86), rgba(13,14,18,.36)), url(${HERO_IMAGES[heroIndex]})` }}>
          <div className="hero-content fade-up">
            <p className="pill">BuildFlow Platform</p>
            <h1>Управляйте стройкой, сметой и клиентом в едином кабинете</h1>
          </div>
        </div>
      </section>

      <section className="media-grid">
        {GALLERY_IMAGES.map((img) => (
          <article
            className="media-card interactive"
            key={img.src}
            onClick={() => openTab(img.tab)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openTab(img.tab)}
          >
            <img src={img.src} alt={img.title} />
            <div className="media-card-body">
              <p>{img.title}</p>
              <small>{img.description}</small>
              <span>{img.cta}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="efficiency-zone">
        <div className="efficiency-head">
          <p className="pill">BuildFlow Analytics</p>
        </div>

        <div className="analytics-lane">
          {ANALYTICS_WIDGETS.map((widget, index) => (
            <article className={`analytics-widget ${index % 2 ? 'align-right' : 'align-left'} ${visibleWidgets[index] ? 'revealed' : ''}`} key={widget.title} data-metric={index} style={{ '--index': index }}>
              <div className="widget-copy">
                <p className="metric-label">{widget.title}</p>
                <strong>{widget.value}%</strong>
                <p>{widget.subtitle}</p>
                <small>{widget.description}</small>
              </div>
              <WidgetVisual widget={widget} revealed={Boolean(visibleWidgets[index])} />
            </article>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-brand">
          <h4>BuildFlow</h4>
          <p>Платформа для прозрачного строительства и расчётов.</p>
          <span>© 2017–2026</span>
        </div>
        <div>
          <h4>Продукт</h4>
          <p>Калькулятор</p>
          <p>Материалы</p>
          <p>Личный кабинет</p>
        </div>
        <div>
          <h4>Ресурсы</h4>
          <p>База знаний</p>
          <p>API</p>
          <p>Интеграции</p>
          <p>Roadmap</p>
        </div>
        <div>
          <h4>Компания</h4>
          <p>О нас</p>
          <p>Политика</p>
          <p>Контакты</p>
          <p>Партнёрство</p>
        </div>
      </footer>
    </>
  );
}

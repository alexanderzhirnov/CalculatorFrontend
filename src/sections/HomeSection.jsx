import React, { useEffect, useRef, useState } from 'react';
import heroFrameImage from '../../media/avel-chuklanov-IB0VA6VdqBw-unsplash.jpg';
import heroBuildImage from '../../media/brett-jordan-PFr50OBMowU-unsplash.jpg';
import heroConcreteImage from '../../media/glenov-brankovic-DWp5nUqTn6E-unsplash.jpg';
import calculatorImage from '../../media/scott-blake-wq7oyx_Kx-4-unsplash.jpg';
import materialsImage from '../../media/jesse-orrico-L94dWXNKwrY-unsplash.jpg';
import cabinetImage from '../../media/pop-zebra-wp81DxKUd1E-unsplash.jpg';
import notebookVideo from '../../media/NOTEbook.mp4';

const HERO_IMAGES = [heroFrameImage, heroBuildImage, heroConcreteImage];

const PRIVATE_GALLERY_IMAGES = [
  {
    src: calculatorImage,
    title: 'Расчёты',
    description: 'Каркас и фундамент',
    tab: 'calculator',
    cta: 'Открыть'
  },
  {
    src: materialsImage,
    title: 'Материалы',
    description: 'Каталог и корзина',
    tab: 'materials',
    cta: 'Открыть'
  },
  {
    src: cabinetImage,
    title: 'Кабинет',
    description: 'Клиенты и сделки',
    tab: 'cabinet',
    cta: 'Открыть'
  }
];

const PRIVATE_SIGNAL_ITEMS = [
  { value: '4', label: 'живых мини-калькулятора' },
  { value: '1', label: 'каталог материалов' },
  { value: '3', label: 'рабочих раздела' }
];

const PUBLIC_SIGNAL_ITEMS = [
  { value: '01', label: 'единая точка входа' },
  { value: '02', label: 'чистый старт без лишнего шума' },
  { value: '03', label: 'доступ к рабочей зоне после входа' }
];

const ANALYTICS_WIDGETS = [
  {
    title: 'Сокращение сроков',
    value: 34,
    subtitle: 'Подготовка сметы быстрее',
    type: 'ring'
  },
  {
    title: 'Экономия бюджета',
    value: 28,
    subtitle: 'Меньше перерасхода',
    type: 'bars',
    bars: [38, 52, 63, 78, 91]
  },
  {
    title: 'Точность планирования',
    value: 93,
    subtitle: 'Точный прогноз по ресурсам',
    type: 'line',
    points: '4,76 42,50 78,58 116,30 152,42 190,18'
  },
  {
    title: 'Продуктивность команды',
    value: 41,
    subtitle: 'Выше темп работы',
    type: 'progress',
    segments: [41, 27, 18, 14]
  }
];

export { HERO_IMAGES };

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

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
        {widget.bars.map((bar, index) => (
          <span
            key={`${widget.title}-${bar}`}
            className={revealed ? 'revealed' : ''}
            style={{ '--bar': `${bar}%`, '--delay': `${index * 110}ms` }}
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
      {widget.segments.map((segment, index) => (
        <span
          key={`${widget.title}-segment-${segment}`}
          className={revealed ? 'revealed' : ''}
          style={{ '--segment': `${segment}%`, '--delay': `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}

function PublicLaptopShowcase({ openTab }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [openProgress, setOpenProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const node = sectionRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const travel = Math.max(rect.height - viewport * 0.36, 1);
      const next = clamp((viewport * 0.72 - rect.top) / travel);
      const rounded = Math.round(next * 1000) / 1000;

      setOpenProgress((prev) => (Math.abs(prev - rounded) > 0.002 ? rounded : prev));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const isOpened = openProgress > 0.92;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isOpened) {
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
      return;
    }

    video.pause();
    if (openProgress < 0.16) {
      video.currentTime = 0;
    }
  }, [isOpened, openProgress]);

  const screenAngle = 84 - openProgress * 84;
  const screenShift = 42 - openProgress * 42;

  return (
    <section ref={sectionRef} className="public-laptop-showcase">
      <div className="public-laptop-stage">
        <div className="public-laptop-copy">
          <p className="pill subtle">Preview Reel</p>
          <h2>Листай вниз и раскрывай ноутбук</h2>

          <div className="public-laptop-meta">
            <span>Сцена открыта</span>
            <strong>{Math.round(openProgress * 100)}%</strong>
          </div>
          <button type="button" className="ghost" onClick={() => openTab('auth')}>
            Открыть доступ
          </button>
        </div>

        <div
          className="public-laptop-shell"
          style={{
            '--screen-angle': `${screenAngle}deg`,
            '--screen-shift': `${screenShift}px`
          }}
        >
          <div className="public-laptop-halo" />

          <div className="public-laptop-device">
            <div className="public-laptop-screen">
              <div className="public-laptop-screen-frame">
                <span className="public-laptop-camera" />

                <div className="public-laptop-screen-chrome" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="public-laptop-video-shell">
                  <div className="public-laptop-video-badge">
                    <span className="public-laptop-video-dot" />
                    <span>Наши заказчики</span>
                  </div>

                  <video
                    ref={videoRef}
                    className={`public-laptop-video ${isOpened ? 'is-playing' : ''}`}
                    src={notebookVideo}
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />

                  <div className={`public-video-curtain ${isOpened ? 'is-hidden' : ''}`} />
                </div>
              </div>
            </div>

            <div className="public-laptop-hinge" />

            <div className="public-laptop-base">
              <div className="public-laptop-deck" aria-hidden="true">
                <div className="public-speaker-strip left" />
                <div className="public-keyboard-grid">
                  {Array.from({ length: 42 }).map((_, index) => (
                    <span key={`key-${index}`} />
                  ))}
                </div>
                <div className="public-speaker-strip right" />
              </div>
              <div className="public-trackpad" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicHome({ heroIndex, openTab }) {
  return (
    <>
      <section className="hero-shell">
        <div
          className="hero-bg"
          style={{ backgroundImage: `linear-gradient(120deg, rgba(13, 14, 18, 0.88), rgba(13, 14, 18, 0.38)), url(${HERO_IMAGES[heroIndex]})` }}
        >
          <div className="hero-content fade-up">
            <p className="pill">BuildFlow</p>
            <h1>Закрытая рабочая зона для строительных проектов</h1>
            <div className="hero-actions">
              <button type="button" onClick={() => openTab('auth')}>
                Войти
              </button>
            </div>
            <div className="hero-signal-row">
              {PUBLIC_SIGNAL_ITEMS.map((item) => (
                <div className="hero-signal-card public" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicLaptopShowcase openTab={openTab} />

      <section className="public-quiet-zone">
        <div className="public-quiet-line" />
        <div className="public-quiet-copy">
          <p className="pill subtle">Private Workspace</p>
          <h2>Личный кабинет и рабочие инструменты скрыты до авторизации</h2>
        </div>
      </section>
    </>
  );
}

function PrivateHome({ heroIndex, openTab, visibleWidgets }) {
  return (
    <>
      <section className="hero-shell">
        <div
          className="hero-bg"
          style={{ backgroundImage: `linear-gradient(120deg, rgba(13, 14, 18, 0.86), rgba(13, 14, 18, 0.36)), url(${HERO_IMAGES[heroIndex]})` }}
        >
          <div className="hero-content fade-up">
            <p className="pill">BuildFlow</p>
            <h1>Материалы, расчёты и сделки в одном ритме</h1>
            <div className="hero-actions">
              <button type="button" onClick={() => openTab('materials')}>
                Материалы
              </button>
              <button type="button" className="ghost" onClick={() => openTab('calculator')}>
                Калькулятор
              </button>
            </div>
            <div className="hero-signal-row">
              {PRIVATE_SIGNAL_ITEMS.map((item) => (
                <div className="hero-signal-card" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="media-grid">
        {PRIVATE_GALLERY_IMAGES.map((item) => (
          <article
            className="media-card interactive"
            key={item.src}
            onClick={() => openTab(item.tab)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && openTab(item.tab)}
          >
            <img src={item.src} alt={item.title} />
            <div className="media-card-body">
              <p>{item.title}</p>
              <small>{item.description}</small>
              <span>{item.cta}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="efficiency-zone">
        <div className="efficiency-head">
          <p className="pill">Пульс проекта</p>
        </div>

        <div className="analytics-lane">
          {ANALYTICS_WIDGETS.map((widget, index) => (
            <article
              className={`analytics-widget ${index % 2 ? 'align-right' : 'align-left'} ${visibleWidgets[index] ? 'revealed' : ''}`}
              key={widget.title}
              data-metric={index}
              style={{ '--index': index }}
            >
              <div className="widget-copy">
                <p className="metric-label">{widget.title}</p>
                <strong>{widget.value}%</strong>
                <p>{widget.subtitle}</p>
              </div>
              <WidgetVisual widget={widget} revealed={Boolean(visibleWidgets[index])} />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default function HomeSection({ heroIndex, openTab, authenticated }) {
  const [visibleWidgets, setVisibleWidgets] = useState({});

  useEffect(() => {
    if (!authenticated) return undefined;

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
  }, [authenticated]);

  if (!authenticated) {
    return <PublicHome heroIndex={heroIndex} openTab={openTab} />;
  }

  return <PrivateHome heroIndex={heroIndex} openTab={openTab} visibleWidgets={visibleWidgets} />;
}

import React, { useEffect, useRef, useState } from 'react';
import heroFrameImage from '../../media/avel-chuklanov-IB0VA6VdqBw-unsplash.jpg';
import heroBuildImage from '../../media/brett-jordan-PFr50OBMowU-unsplash.jpg';
import heroConcreteImage from '../../media/glenov-brankovic-DWp5nUqTn6E-unsplash.jpg';
import calculatorImage from '../../media/scott-blake-wq7oyx_Kx-4-unsplash.jpg';
import materialsImage from '../../media/jesse-orrico-L94dWXNKwrY-unsplash.jpg';
import cabinetImage from '../../media/pop-zebra-wp81DxKUd1E-unsplash.jpg';
import notebookVideo from '../../media/NOTEbook.mp4';
import { BRAND_NAME } from '../utils/dashboard';

const HERO_IMAGES = [heroFrameImage, heroBuildImage, heroConcreteImage];

const MODULE_ITEMS = [
  {
    src: calculatorImage,
    title: 'Расчёты',
    tab: 'calculator'
  },
  {
    src: materialsImage,
    title: 'Материалы',
    tab: 'materials'
  },
  {
    src: cabinetImage,
    title: 'Личный кабинет',
    tab: 'cabinet'
  }
];

const WORKSPACE_SIGNAL_ITEMS = [
  { value: '4', label: 'калькулятора' },
  { value: '1', label: 'каталог' },
  { value: '3', label: 'раздела' }
];

const PUBLIC_SIGNAL_ITEMS = [
  { value: '01', label: 'доступ без входа' },
  { value: '02', label: 'разделы после входа' },
  { value: '03', label: 'поддержка внизу' }
];

const VIDEO_INFO_ITEMS = [
  {
    value: '2 минуты',
    title: 'На старт расчёта'
  },
  {
    value: '3 сценария',
    title: 'В одном потоке'
  },
  {
    value: 'API и CRM',
    title: 'Под интеграции'
  }
];

const SYSTEM_PULSE_ITEMS = [
  {
    value: '4',
    title: 'Инструмента'
  },
  {
    value: '3',
    title: 'Раздела'
  },
  {
    value: '1',
    title: 'Канал поддержки'
  },
  {
    value: '1',
    title: 'Контур развития'
  }
];

export { HERO_IMAGES };

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function WorkspaceLaunchpad({ authenticated, openTab }) {
  return (
    <section className="workspace-launchpad">
      <div className="workspace-launchpad-head">
        <div className="workspace-launchpad-copy">
          <p className="pill">Разделы</p>
          <h2>Быстрый доступ</h2>
        </div>

        <div className="workspace-signal-strip">
          {WORKSPACE_SIGNAL_ITEMS.map((item) => (
            <article className="workspace-signal-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </div>

      <section className="media-grid media-grid-compact">
        {MODULE_ITEMS.map((item) => (
          <article
            className="media-card interactive compact-media-card"
            key={item.title}
            onClick={() => openTab(authenticated ? item.tab : 'auth')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) =>
              (event.key === 'Enter' || event.key === ' ') && openTab(authenticated ? item.tab : 'auth')
            }
          >
            <img src={item.src} alt={item.title} />
            <div className="media-card-body">
              <p>{item.title}</p>
              <span>{authenticated ? 'Перейти' : 'Открыть'}</span>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function CalculatorPreviewSection({ authenticated, openTab }) {
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
          <p className="pill subtle">Видео калькулятора</p>
          <h2>Калькулятор в работе</h2>

          <button type="button" className="ghost" onClick={() => openTab(authenticated ? 'calculator' : 'auth')}>
            {authenticated ? 'Перейти в калькулятор' : 'Открыть доступ'}
          </button>

          <div className="public-laptop-insights">
            {VIDEO_INFO_ITEMS.map((item) => (
              <article className="public-laptop-insight-card" key={item.title}>
                <strong>{item.value}</strong>
                <span>{item.title}</span>
              </article>
            ))}
          </div>
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
                    <span>Превью расчётного сценария</span>
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

function SystemPulseSection() {
  return (
    <section className="system-pulse-section">
      <div className="system-pulse-head">
        <div>
          <p className="pill">Пульс системы</p>
          <h2>Ключевые показатели</h2>
        </div>
      </div>

      <div className="system-pulse-grid">
        {SYSTEM_PULSE_ITEMS.map((item) => (
          <article className="system-pulse-card" key={item.title}>
            <strong>{item.value}</strong>
            <span>{item.title}</span>
          </article>
        ))}
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
            <p className="pill">{BRAND_NAME}</p>
            <h1>Строительные расчёты и материалы в одном сервисе</h1>
            <p className="hero-description">Главная показывает разделы, калькулятор и поддержку.</p>
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

      <WorkspaceLaunchpad authenticated={false} openTab={openTab} />
      <CalculatorPreviewSection authenticated={false} openTab={openTab} />
      <SystemPulseSection />
    </>
  );
}

function PrivateHome({ heroIndex, openTab }) {
  return (
    <>
      <section className="hero-shell">
        <div
          className="hero-bg"
          style={{ backgroundImage: `linear-gradient(120deg, rgba(13, 14, 18, 0.86), rgba(13, 14, 18, 0.36)), url(${HERO_IMAGES[heroIndex]})` }}
        >
          <div className="hero-content fade-up">
            <p className="pill">{BRAND_NAME}</p>
            <h1>Материалы, расчёты и кабинет в одном месте</h1>
            <p className="hero-description">Быстрый вход в основные разделы.</p>
            <div className="hero-actions">
              <button type="button" onClick={() => openTab('materials')}>
                Материалы
              </button>
              <button type="button" className="ghost" onClick={() => openTab('calculator')}>
                Калькулятор
              </button>
            </div>
            <div className="hero-signal-row">
              {WORKSPACE_SIGNAL_ITEMS.map((item) => (
                <div className="hero-signal-card" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WorkspaceLaunchpad authenticated openTab={openTab} />
      <CalculatorPreviewSection authenticated openTab={openTab} />
      <SystemPulseSection />
    </>
  );
}

export default function HomeSection({ heroIndex, openTab, authenticated }) {
  if (!authenticated) {
    return <PublicHome heroIndex={heroIndex} openTab={openTab} />;
  }

  return <PrivateHome heroIndex={heroIndex} openTab={openTab} />;
}

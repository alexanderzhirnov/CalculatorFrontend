import React from 'react';
import { BRAND_NAME, SUPPORT_CONTACTS } from '../utils/dashboard';
import SupportRequestForm from './SupportRequestForm';

const HOME_CAPABILITIES = [
  {
    title: 'Расчёты',
    text: 'Каркас и фундамент.'
  },
  {
    title: 'Материалы',
    text: 'Каталог и подбор.'
  },
  {
    title: 'Клиенты',
    text: 'Клиент и кабинет.'
  }
];

const INTEGRATION_ITEMS = [
  'API обмена.',
  'CRM-синхронизация.',
  'Автоматизация действий.'
];

function FooterInfoCard({ title, children, panelId }) {
  return (
    <section id={panelId} className="footer-info-card">
      <h4>{title}</h4>
      <div className="footer-info-card-body">{children}</div>
    </section>
  );
}

function HomeFooter({ authenticated, openTab, tab }) {
  const navItems = authenticated
    ? [
        ['home', 'Главная'],
        ['calculator', 'Калькуляторы'],
        ['materials', 'Материалы'],
        ['cabinet', 'Личный кабинет']
      ]
    : [
        ['home', 'Главная'],
        ['auth', 'Вход']
      ];

  return (
    <footer className="site-footer-shell site-footer-shell-home">
      <div className="site-footer-inner">
        <div className="footer-home-stage">
          <section className="footer-home-showcase">
            <div className="footer-home-showcase-copy">
              <span className="footer-eyebrow">Платформа строительных расчётов</span>
              <h2>{BRAND_NAME}</h2>
              <p className="footer-home-lead">Расчёты, материалы, клиенты и поддержка в одном интерфейсе.</p>

              <div className="footer-capability-grid">
                {HOME_CAPABILITIES.map((item) => (
                  <article key={item.title} className="footer-capability-card">
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="footer-home-showcase-side">
              <div className="footer-mini-card">
                <span className="footer-mini-card-label">Разделы</span>
                <div className="footer-mini-card-actions">
                  {navItems.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`ghost footer-bottom-link ${tab === key ? 'active' : ''}`}
                      onClick={() => openTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="ghost footer-bottom-link"
                    onClick={() => document.getElementById('support-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    Поддержка
                  </button>
                </div>
              </div>

              <div className="footer-mini-card accent">
                <span className="footer-mini-card-label">Сейчас</span>
                <div className="footer-mini-card-stack">
                  <div>
                    <strong>Главная</strong>
                    <span>Обзор сервиса.</span>
                  </div>
                  <div>
                    <strong>Калькуляторы</strong>
                    <span>Рабочие расчёты.</span>
                  </div>
                  <div>
                    <strong>Кабинет</strong>
                    <span>Персональные данные.</span>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section id="support-feedback" className="footer-support-card">
            <div className="footer-support-card-head">
              <div>
                <span className="footer-eyebrow accent">Техподдержка</span>
                <h3>Связь через Telegram</h3>
                <p>Форма отправляет сообщение прямо в чат поддержки.</p>
              </div>

              <div className="footer-support-badges">
                <span>Telegram</span>
                <span>{SUPPORT_CONTACTS.schedule}</span>
              </div>
            </div>

            <div className="footer-support-summary">
              <div className="footer-support-summary-card">
                <span>Телефон поддержки</span>
                <strong>{SUPPORT_CONTACTS.phone}</strong>
              </div>
              <div className="footer-support-summary-card">
                <span>Telegram поддержки</span>
                <strong>{SUPPORT_CONTACTS.telegram}</strong>
              </div>
              <div className="footer-support-summary-card">
                <span>График</span>
                <strong>{SUPPORT_CONTACTS.schedule}</strong>
              </div>
            </div>

            <SupportRequestForm source={`footer-${tab || 'home'}`} page={tab || 'home'} compact />
          </section>

          <div className="footer-info-grid">
            <FooterInfoCard title="Контактные данные">
              <div className="footer-contact-list">
                <div className="footer-contact-row">
                  <span>Телефон</span>
                  <strong>{SUPPORT_CONTACTS.phone}</strong>
                </div>
                <div className="footer-contact-row">
                  <span>Telegram</span>
                  <strong>{SUPPORT_CONTACTS.telegram}</strong>
                </div>
                <div className="footer-contact-row">
                  <span>График связи</span>
                  <strong>{SUPPORT_CONTACTS.schedule}</strong>
                </div>
              </div>
              <small>Контакты можно заменить на реальные.</small>
            </FooterInfoCard>

            <FooterInfoCard title="API, интеграции и автоматизация">
              <ul className="footer-bullet-list">
                {INTEGRATION_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="footer-tag-row">
                <span>API</span>
                <span>Интеграции</span>
                <span>CRM</span>
                <span>Автоматизация</span>
              </div>
            </FooterInfoCard>
          </div>

          <div className="footer-bottom-bar">
            <div className="footer-bottom-actions">
              <button type="button" className="ghost footer-bottom-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Наверх
              </button>
            </div>

            <p>{SUPPORT_CONTACTS.note}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function SiteFooter(props) {
  return <HomeFooter authenticated={props.authenticated} openTab={props.openTab} tab={props.tab} />;
}

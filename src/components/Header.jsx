import React from 'react';
import { BRAND_NAME } from '../utils/dashboard';

function GuestAccessIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8l4 4-4 4" />
      <path d="M14 12H4" />
    </svg>
  );
}

export default function Header({ tab, compactHeader, isMenuOpen, setMenuOpen, openTab, auth, openAuthModal }) {
  const navItems = auth.authenticated
    ? [
        ['home', 'Главная'],
        ['calculator', 'Калькулятор'],
        ['materials', 'Материалы'],
        ['cabinet', 'Личный кабинет']
      ]
    : [];

  return (
    <header className={`header glass full-top ${compactHeader ? 'compact' : ''}`}>
      <div className="header-row">
        <button type="button" className="brand brand-btn" onClick={() => openTab('home')}>
          {BRAND_NAME}
        </button>

        <button className="burger-btn" type="button" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Открыть меню">
          ☰
        </button>

        {navItems.length ? (
          <nav className={`${compactHeader ? 'mobile-nav' : ''} ${isMenuOpen ? 'open' : ''}`}>
            {navItems.map(([value, title]) => (
              <button key={value} className={`tab-btn ${tab === value ? 'active' : ''}`} onClick={() => openTab(value)}>
                {title}
              </button>
            ))}
          </nav>
        ) : (
          <div className="header-spacer" />
        )}

        <button
          className={`user-entry ${auth.authenticated ? 'is-authenticated' : 'is-guest'}`}
          type="button"
          onClick={openAuthModal}
          aria-label={auth.authenticated ? `Аккаунт ${auth.authInfo}` : 'Открыть авторизацию'}
        >
          <span className="user-entry-ring" />
          <span className="user-avatar">
            {auth.authenticated ? auth.authInfo.slice(0, 1).toUpperCase() : <GuestAccessIcon />}
          </span>
          <span className="user-entry-dot" />
        </button>
      </div>
    </header>
  );
}

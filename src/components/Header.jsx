import React from 'react';

export default function Header({ tab, compactHeader, isMenuOpen, setMenuOpen, openTab, auth, openAuthModal }) {
  return (
    <header className={`header glass full-top ${compactHeader ? 'compact' : ''}`}>
      <div className="header-row">
        <div className="brand">BuildFlow</div>
        <button className="burger-btn" type="button" onClick={() => setMenuOpen((prev) => !prev)}>☰</button>
        <nav className={`${compactHeader ? 'mobile-nav' : ''} ${isMenuOpen ? 'open' : ''}`}>
          {[['home', 'Главная'], ['calculator', 'Калькулятор'], ['materials', 'Материалы'], ['cabinet', 'Личный кабинет']].map(([v, t]) => (
            <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => openTab(v)}>{t}</button>
          ))}
        </nav>
        <button className="user-entry" type="button" onClick={openAuthModal}>
          <span className="user-icon">👤</span>
          <span>{auth.authenticated ? auth.authInfo : 'Войти'}</span>
        </button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ tab, compactHeader, isMenuOpen, setMenuOpen, openTab, auth, openAuthModal }) {
  const navItems = auth.authenticated
    ? [['home', 'Главная'], ['calculator', 'Калькулятор'], ['materials', 'Материалы'], ['cabinet', 'Личный кабинет']]
    : [['home', 'Главная']];

  return (
    <header className={`header glass full-top ${compactHeader ? 'compact' : ''}`}>
      <div className="header-row">
        <div className="brand">BuildFlow</div>
        <button className="burger-btn" type="button" onClick={() => setMenuOpen((prev) => !prev)}>☰</button>
        <nav className={`${compactHeader ? 'mobile-nav' : ''} ${isMenuOpen ? 'open' : ''}`}>
          {navItems.map(([v, t]) => (
            <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => openTab(v)}>{t}</button>
          ))}
        </nav>
        <button className={`user-entry ${auth.authenticated ? 'is-authenticated' : 'is-guest'}`} type="button" onClick={openAuthModal} aria-label={auth.authenticated ? `Аккаунт ${auth.authInfo}` : 'Открыть авторизацию'}>
          <span className="user-entry-ring" />
          <span className="user-avatar">{auth.authenticated ? auth.authInfo.slice(0, 1).toUpperCase() : ''}</span>
          <span className="user-entry-dot" />
        </button>
      </div>
    </header>
  );
}

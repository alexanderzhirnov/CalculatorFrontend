import React, { useEffect, useState } from 'react';
import authBackground from '../../media/auth.jpg';
import { BRAND_NAME } from '../utils/dashboard';

function CraneIntro({ onSkip }) {
  return (
    <div className="auth-intro-screen">
      <div className="auth-intro-copy">
        <p className="pill">Доступ в {BRAND_NAME}</p>
        <h2>Собираем вход в рабочую зону</h2>
        <button className="ghost auth-intro-skip" type="button" onClick={onSkip}>Пропустить</button>
      </div>

      <div className="auth-crane-scene" aria-hidden="true">
        <div className="scene-glow" />
        <div className="scene-floor" />

        <div className="scene-crane">
          <span className="crane-mast" />
          <span className="crane-arm" />
          <span className="crane-counterweight" />
          <span className="crane-cable" />
          <span className="crane-hook" />
          <span className="crane-load" />
        </div>

        <div className="scene-house">
          <span className="house-foundation" />
          <span className="house-wall wall-left" />
          <span className="house-wall wall-right" />
          <span className="house-window window-left" />
          <span className="house-window window-right" />
          <span className="house-door" />
          <span className="house-roof" />
          <span className="house-roof-line" />
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props) {
  const {
    auth,
    authMode,
    setAuthMode,
    loadingAuth,
    loadingRegister,
    registerForm,
    setRegisterForm,
    setAuth,
    onLogin,
    onRegister,
    onRefresh,
    onLogout,
    onClose,
    onOpenTab
  } = props;

  const [showForm, setShowForm] = useState(auth.authenticated);

  useEffect(() => {
    if (auth.authenticated) {
      setShowForm(true);
      return undefined;
    }

    setShowForm(false);
    const timer = window.setTimeout(() => setShowForm(true), 2400);
    return () => window.clearTimeout(timer);
  }, [auth.authenticated]);

  if (!showForm && !auth.authenticated) {
    return (
      <section className="auth-page auth-page-intro" style={{ backgroundImage: `linear-gradient(180deg, rgba(6, 16, 34, 0.58), rgba(5, 14, 30, 0.82)), url(${authBackground})` }}>
        <CraneIntro onSkip={() => setShowForm(true)} />
      </section>
    );
  }

  return (
    <section className="auth-page" style={{ backgroundImage: `linear-gradient(180deg, rgba(6, 16, 34, 0.54), rgba(5, 14, 30, 0.78)), url(${authBackground})` }}>
      <div className="auth-page-shell auth-page-shell-minimal">
        <aside className="card auth-page-aside auth-page-aside-minimal">
          <p className="pill">{BRAND_NAME}</p>
          <h2>{auth.authenticated ? 'Сессия активна' : authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>
          <span className="auth-aside-line" />
        </aside>

        <div className="auth-page-panel card gradient-border auth-page-panel-minimal">
          <div className="auth-modal-head">
            <h3>{auth.authenticated ? auth.authInfo : 'Авторизация'}</h3>
            <button className="ghost auth-close" type="button" onClick={onClose}>✕</button>
          </div>

          {!auth.authenticated ? (
            <>
              <div className="auth-switcher">
                <button type="button" className={`switch-btn ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Вход</button>
                <button type="button" className={`switch-btn ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Регистрация</button>
              </div>

              {authMode === 'login' ? (
                <form className="login-form single-auth" onSubmit={onLogin}>
                  <label className="field-group">
                    <span>Логин</span>
                    <input
                      value={auth.login}
                      onChange={(e) => setAuth((p) => ({ ...p, login: e.target.value }))}
                      placeholder="Введите логин"
                      autoComplete="username"
                      required
                    />
                  </label>

                  <label className="field-group">
                    <span>Пароль</span>
                    <input
                      type="password"
                      value={auth.password}
                      onChange={(e) => setAuth((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Введите пароль"
                      autoComplete="current-password"
                      required
                    />
                  </label>

                  <button type="submit">{loadingAuth ? 'Входим...' : 'Войти'}</button>
                </form>
              ) : (
                <form className="login-form register-form single-auth" onSubmit={onRegister}>
                  <label className="field-group">
                    <span>Фамилия</span>
                    <input value={registerForm.lastName} onChange={(e) => setRegisterForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Фамилия" autoComplete="family-name" />
                  </label>

                  <label className="field-group">
                    <span>Имя</span>
                    <input value={registerForm.firstName} onChange={(e) => setRegisterForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="Имя" autoComplete="given-name" />
                  </label>

                  <label className="field-group">
                    <span>Логин</span>
                    <input value={registerForm.login} onChange={(e) => setRegisterForm((p) => ({ ...p, login: e.target.value }))} placeholder="Логин" autoComplete="username" required />
                  </label>

                  <label className="field-group">
                    <span>Пароль</span>
                    <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} placeholder="Пароль" autoComplete="new-password" required />
                  </label>

                  <button type="submit">{loadingRegister ? 'Создаём...' : 'Создать аккаунт'}</button>
                </form>
              )}
            </>
          ) : (
            <div className="auth-profile-wrap">
              <div className="auth-profile-card">
                <p className="auth-profile-label">Аккаунт</p>
                <strong>{auth.authInfo}</strong>
              </div>

              <div className="auth-actions account-actions">
                <button className="ghost" type="button" onClick={onRefresh}>Обновить</button>
                <button className="ghost danger" type="button" onClick={onLogout}>Выйти</button>
              </div>

              <div className="auth-shortcuts">
                <button className="ghost" type="button" onClick={() => onOpenTab('home')}>Главная</button>
                <button className="ghost" type="button" onClick={() => onOpenTab('materials')}>Материалы</button>
                <button className="ghost" type="button" onClick={() => onOpenTab('cabinet')}>Личный кабинет</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

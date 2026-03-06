import React, { useEffect } from 'react';

export default function AuthModal(props) {
  const { open, close, auth, authMode, setAuthMode, loadingAuth, loadingRegister, registerForm, setRegisterForm, setAuth, onLogin, onRegister, onRefresh, onLogout } = props;
  useEffect(() => {
    if (!open) return undefined;

    const originalOverflow = document.body.style.overflow;
    const originalOverflowX = document.body.style.overflowX;

    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overflowX = originalOverflowX;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="auth-modal-backdrop" onClick={close}>
      <div className="auth-modal card gradient-border" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-head">
          <h3>{auth.authenticated ? `Профиль: ${auth.authInfo}` : 'Вход в BuildFlow'}</h3>
          <button className="ghost" type="button" onClick={close}>✕</button>
        </div>

        {!auth.authenticated ? (
          <>
            <div className="auth-switcher">
              <button type="button" className={`switch-btn ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Вход</button>
              <button type="button" className={`switch-btn ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Регистрация</button>
            </div>
            {authMode === 'login' ? (
              <form className="login-form single-auth" onSubmit={onLogin}>
                <input value={auth.login} onChange={(e) => setAuth((p) => ({ ...p, login: e.target.value }))} placeholder="Логин" />
                <input type="password" value={auth.password} onChange={(e) => setAuth((p) => ({ ...p, password: e.target.value }))} placeholder="Пароль" />
                <button type="submit">{loadingAuth ? 'Входим...' : 'Войти'}</button>
              </form>
            ) : (
              <form className="login-form register-form single-auth" onSubmit={onRegister}>
                <input value={registerForm.lastName} onChange={(e) => setRegisterForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Фамилия" />
                <input value={registerForm.firstName} onChange={(e) => setRegisterForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="Имя" />
                <input value={registerForm.login} onChange={(e) => setRegisterForm((p) => ({ ...p, login: e.target.value }))} placeholder="Логин (мин. 3 символа)" required />
                <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} placeholder="Пароль (мин. 8 символов)" required />
                <button type="submit">{loadingRegister ? 'Регистрируем...' : 'Создать аккаунт'}</button>
              </form>
            )}
          </>
        ) : (
          <div className="auth-actions account-actions">
            <button className="ghost" type="button" onClick={onRefresh}>Обновить сессию</button>
            <button className="ghost danger" type="button" onClick={onLogout}>Выйти</button>
          </div>
        )}
      </div>
    </div>
  );
}

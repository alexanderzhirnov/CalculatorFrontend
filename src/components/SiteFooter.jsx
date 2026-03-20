import React from 'react';

const TAB_LABELS = {
  home: 'Главная',
  calculator: 'Калькулятор',
  materials: 'Материалы',
  cabinet: 'Кабинет',
  auth: 'Авторизация'
};

export default function SiteFooter({
  authenticated,
  tab,
  openTab,
  loadMaterials,
  loadingMaterials,
  materialsCount,
  cartCount
}) {
  const navItems = authenticated
    ? [['home', 'Главная'], ['calculator', 'Калькулятор'], ['materials', 'Материалы'], ['cabinet', 'Кабинет']]
    : [['home', 'Главная'], ['auth', 'Войти']];

  const isMaterialsTab = authenticated && tab === 'materials';

  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <p className="pill subtle">BuildFlow</p>
        <strong>{TAB_LABELS[tab] || 'Раздел'}</strong>
      </div>

      <div className="site-footer-column">
        <h4>Разделы</h4>
        <div className="site-footer-action-list">
          {navItems.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`ghost site-footer-link ${tab === key ? 'active' : ''}`}
              onClick={() => openTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="site-footer-column">
        <h4>Действия</h4>
        <div className="site-footer-action-list">
          <button type="button" className="ghost site-footer-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Наверх
          </button>

          {authenticated ? (
            isMaterialsTab ? (
              <button type="button" className="ghost site-footer-link" onClick={loadMaterials} disabled={loadingMaterials}>
                {loadingMaterials ? 'Обновляем...' : 'Обновить'}
              </button>
            ) : (
              <button type="button" className="ghost site-footer-link" onClick={() => openTab('materials')}>
                Открыть материалы
              </button>
            )
          ) : (
            <button type="button" className="ghost site-footer-link" onClick={() => openTab('auth')}>
              Открыть вход
            </button>
          )}
        </div>
      </div>

      <div className="site-footer-column">
        <h4>Статус</h4>
        <div className="site-footer-status-list">
          <div>
            <span>Доступ</span>
            <strong>{authenticated ? 'Авторизован' : 'Гостевой режим'}</strong>
          </div>

          {isMaterialsTab && (
            <>
              <div>
                <span>Материалов</span>
                <strong>{materialsCount}</strong>
              </div>
              <div>
                <span>В корзине</span>
                <strong>{cartCount}</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}

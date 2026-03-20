import React, { useMemo } from 'react';
import QuickToolsSection from './QuickToolsSection';

const THICKNESS_LABELS = {
  MM_100: '100 мм',
  MM_150: '150 мм',
  MM_200: '200 мм'
};

function getThicknessLabel(value) {
  return THICKNESS_LABELS[value] || value || '—';
}

function getClientName(client) {
  if (!client) return 'Не выбран';
  return [client.lastName, client.firstName].filter(Boolean).join(' ') || `Клиент #${client.id}`;
}

function WorkspaceMetric({ label, value, accent }) {
  return (
    <div className={`calculator-hero-metric ${accent ? 'accent' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CalculatorSection(props) {
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    loadClients,
    address,
    setAddress,
    createCalculation,
    calcId,
    setCalcId,
    frameParams,
    setFrameParams,
    foundationParams,
    setFoundationParams,
    postFrame,
    postFoundation,
    openTab
  } = props;

  const selectedClient = useMemo(
    () => clients.find((client) => String(client.id) === String(selectedClientId)),
    [clients, selectedClientId]
  );

  return (
    <section className="calculator-workspace">
      <article className="card calculator-hero-card">
        <div className="calculator-hero-copy">
          <p className="pill">Калькулятор</p>
          <h2>Рабочий стол расчётов</h2>

          <div className="calculator-hero-actions">
            <button type="button" onClick={() => openTab('materials')}>
              Материалы
            </button>
            <button type="button" className="ghost" onClick={() => openTab('cabinet')}>
              Кабинет
            </button>
          </div>
        </div>

        <div className="calculator-hero-metrics">
          <WorkspaceMetric label="Клиент" value={getClientName(selectedClient)} accent />
          <WorkspaceMetric label="ID расчёта" value={calcId || '—'} />
          <WorkspaceMetric label="Этажей" value={frameParams.floors} />
          <WorkspaceMetric label="Периметр" value={`${foundationParams.externalPerimeter} м`} />
        </div>
      </article>

      <div className="calculator-workspace-grid">
        <aside className="calculator-workspace-sidebar">
          <article className="card calculator-command-card">
            <p className="pill subtle">Проект</p>
            <h3>Клиент и расчёт</h3>

            <div className="calculator-form-stack">
              <div className="row">
                <button type="button" onClick={loadClients}>
                  Загрузить клиентов
                </button>
                <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)}>
                  {!clients.length && <option value="">Сначала загрузите клиентов</option>}
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {getClientName(client)}
                    </option>
                  ))}
                </select>
              </div>

              <label className="calculator-field">
                <span>Адрес</span>
                <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Адрес строительства" />
              </label>

              <button type="button" onClick={createCalculation}>
                Создать расчёт
              </button>

              <label className="calculator-field">
                <span>ID</span>
                <input value={calcId} onChange={(event) => setCalcId(event.target.value)} placeholder="ID расчёта" />
              </label>
            </div>
          </article>

          <article className="card calculator-status-card">
            <p className="pill subtle">Сводка</p>
            <h3>Текущие параметры</h3>
            <div className="calculator-status-list">
              <div>
                <span>Высота этажа</span>
                <strong>{frameParams.floorHeight} м</strong>
              </div>
              <div>
                <span>Наружные стены</span>
                <strong>{getThicknessLabel(frameParams.extWallThickness)}</strong>
              </div>
              <div>
                <span>Перекрытие</span>
                <strong>{getThicknessLabel(frameParams.ceilingThickness)}</strong>
              </div>
              <div>
                <span>Внутренние стены</span>
                <strong>{foundationParams.innerWallLength} м</strong>
              </div>
            </div>
          </article>
        </aside>

        <div className="calculator-workspace-main">
          <QuickToolsSection
            layout="vertical"
            animated
            title="Быстрые инструменты"
            intro=""
            showSuiteNote={false}
          />

          <div className="calculator-engine-grid">
            <article className="card calculator-form-card">
              <p className="pill subtle">Каркас</p>
              <h3>Параметры дома</h3>

              <div className="calculator-form-stack">
                <div className="row">
                  <label>Этажей</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={frameParams.floors}
                    onChange={(event) => setFrameParams((prev) => ({ ...prev, floors: event.target.value }))}
                  />
                </div>

                <div className="row">
                  <label>Высота</label>
                  <input
                    type="number"
                    value={frameParams.floorHeight}
                    onChange={(event) => setFrameParams((prev) => ({ ...prev, floorHeight: event.target.value }))}
                  />
                </div>

                <div className="row">
                  <label>Периметр</label>
                  <input
                    type="number"
                    value={frameParams.perimeter}
                    onChange={(event) => setFrameParams((prev) => ({ ...prev, perimeter: event.target.value }))}
                  />
                </div>

                <button type="button" onClick={postFrame}>
                  Рассчитать каркас
                </button>
              </div>
            </article>

            <article className="card calculator-form-card">
              <p className="pill subtle">Фундамент</p>
              <h3>Контур</h3>

              <div className="calculator-form-stack">
                <div className="row">
                  <label>Периметр</label>
                  <input
                    type="number"
                    value={foundationParams.externalPerimeter}
                    onChange={(event) => setFoundationParams((prev) => ({ ...prev, externalPerimeter: event.target.value }))}
                  />
                </div>

                <div className="row">
                  <label>Внутренние стены</label>
                  <input
                    type="number"
                    value={foundationParams.innerWallLength}
                    onChange={(event) => setFoundationParams((prev) => ({ ...prev, innerWallLength: event.target.value }))}
                  />
                </div>

                <button type="button" onClick={postFoundation}>
                  Рассчитать фундамент
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

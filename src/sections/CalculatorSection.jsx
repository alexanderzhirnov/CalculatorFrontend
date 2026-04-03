import React, { useMemo, useRef } from 'react';
import QuickToolsSection from './QuickToolsSection';
import { formatCurrency, formatDateTime, getCalculationTitle, getClientName, getStatusMeta } from '../utils/dashboard';

const THICKNESS_LABELS = {
  MM_100: '100 мм',
  MM_150: '150 мм',
  MM_200: '200 мм'
};

function getThicknessLabel(value) {
  return THICKNESS_LABELS[value] || value || '—';
}

function WorkspaceMetric({ label, value, accent }) {
  return (
    <div className={`calculator-hero-metric ${accent ? 'accent' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getElementLabel(type) {
  if (type === 'FRAME') return 'Каркас';
  if (type === 'FOUNDATION') return 'Фундамент';
  return 'Раздел';
}

function formatQuantity(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return amount.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
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
    clientForm,
    setClientForm,
    createClient,
    creatingClient,
    calcId,
    setCalcId,
    frameParams,
    setFrameParams,
    foundationParams,
    setFoundationParams,
    postFrame,
    postFoundation,
    openTab,
    recentCalculations
  } = props;

  const selectedClient = useMemo(
    () => clients.find((client) => String(client.id) === String(selectedClientId)),
    [clients, selectedClientId]
  );

  const activeCalculation = useMemo(
    () => recentCalculations.find((calculation) => String(calculation.id) === String(calcId)) || recentCalculations[0] || null,
    [calcId, recentCalculations]
  );
  const calculatedElements = useMemo(
    () => (activeCalculation?.elements || []).filter((element) => Array.isArray(element.resultItems) && element.resultItems.length),
    [activeCalculation]
  );
  const totalResultItems = useMemo(
    () => calculatedElements.reduce((total, element) => total + element.resultItems.length, 0),
    [calculatedElements]
  );
  const widgetsRef = useRef(null);

  function scrollToWidgets() {
    const node = widgetsRef.current;
    if (!node) return;

    const top = node.getBoundingClientRect().top + window.scrollY - 92;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  return (
    <section className="calculator-workspace">
      <article className="card calculator-hero-card">
        <div className="calculator-hero-copy">
          <p className="pill">Калькулятор</p>
          <h2>Рабочий стол расчётов</h2>
          <p>
            Выберите клиента, задайте адрес объекта и переключайтесь между последними расчётами карточками, а не по
            техническому номеру.
          </p>

          <div className="calculator-hero-actions">
            <button type="button" onClick={() => openTab('materials')}>
              Материалы
            </button>
            <button type="button" className="ghost" onClick={scrollToWidgets}>
              К виджетам
            </button>
          </div>
        </div>

        <div className="calculator-hero-metrics">
          <WorkspaceMetric label="Клиент" value={getClientName(selectedClient)} accent />
          <WorkspaceMetric
            label="Активный объект"
            value={activeCalculation ? getCalculationTitle(activeCalculation) : 'Расчёт ещё не выбран'}
          />
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

              <div className="calculator-client-create">
                <div className="calculator-subhead">
                  <strong>Новый клиент</strong>
                  <small>Если клиента ещё нет в списке, добавьте его прямо отсюда.</small>
                </div>

                <div className="calculator-inline-grid">
                  <label className="calculator-field">
                    <span>Фамилия</span>
                    <input
                      value={clientForm.lastName}
                      onChange={(event) => setClientForm((prev) => ({ ...prev, lastName: event.target.value }))}
                      placeholder="Иванов"
                    />
                  </label>

                  <label className="calculator-field">
                    <span>Имя</span>
                    <input
                      value={clientForm.firstName}
                      onChange={(event) => setClientForm((prev) => ({ ...prev, firstName: event.target.value }))}
                      placeholder="Иван"
                    />
                  </label>
                </div>

                <div className="calculator-inline-grid">
                  <label className="calculator-field">
                    <span>Телефон</span>
                    <input
                      value={clientForm.phone}
                      onChange={(event) => setClientForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="+7 (900) 000-00-00"
                    />
                  </label>

                  <label className="calculator-field">
                    <span>Email</span>
                    <input
                      value={clientForm.email}
                      onChange={(event) => setClientForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="client@example.ru"
                    />
                  </label>
                </div>

                <button type="button" className="ghost" onClick={createClient} disabled={creatingClient}>
                  {creatingClient ? 'Сохраняем клиента...' : 'Добавить клиента'}
                </button>
              </div>

              <label className="calculator-field">
                <span>Адрес объекта</span>
                <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Адрес строительства" />
              </label>

              <button type="button" onClick={createCalculation}>
                Создать расчёт
              </button>

              <label className="calculator-field">
                <span>Активный расчёт</span>
                <select value={calcId} onChange={(event) => setCalcId(event.target.value)}>
                  {!recentCalculations.length && <option value="">Расчёты выбранного клиента появятся здесь</option>}
                  {recentCalculations.map((calculation) => (
                    <option key={calculation.id} value={calculation.id}>
                      {`${getCalculationTitle(calculation)} • ${getStatusMeta(calculation.status).label}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          <article className="card calculator-recent-card">
            <div className="calculator-recent-head">
              <div>
                <p className="pill subtle">Предыдущие расчёты</p>
                <h3>Последние карточки клиента</h3>
              </div>
            </div>

            <div className="calculator-recent-list">
              {recentCalculations.length ? (
                recentCalculations.slice(0, 4).map((calculation) => {
                  const statusMeta = getStatusMeta(calculation.status);
                  const isActive = String(calculation.id) === String(calcId);

                  return (
                    <article className={`calculator-recent-item ${isActive ? 'active' : ''}`} key={calculation.id}>
                      <div>
                        <div className="calculator-recent-topline">
                          <strong>{getCalculationTitle(calculation)}</strong>
                          <span className={`status-pill tone-${statusMeta.tone}`}>{statusMeta.label}</span>
                        </div>
                        <small>{formatDateTime(calculation.createdAt)}</small>
                      </div>

                      <button type="button" className="ghost" onClick={() => setCalcId(String(calculation.id))}>
                        Выбрать
                      </button>
                    </article>
                  );
                })
              ) : (
                <div className="cabinet-empty-state compact">
                  <strong>Пока нет сохранённых расчётов</strong>
                  <p>Как только для выбранного клиента появится история, её можно будет открыть кнопкой «Выбрать».</p>
                </div>
              )}
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
          <div ref={widgetsRef} className="calculator-widgets-anchor">
            <QuickToolsSection
              variant="workspace"
              animated
              title="Быстрые виджеты"
              kicker="Вспомогательные расчёты"
              intro="Четыре мини-калькулятора рядом с основным рабочим столом."
              showSuiteNote={false}
            />
          </div>

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

          <article className="card calculator-results-card">
            <div className="calculator-recent-head">
              <div>
                <p className="pill subtle">Результат расчёта</p>
                <h3>{activeCalculation ? getCalculationTitle(activeCalculation) : 'Выберите расчёт'}</h3>
              </div>
            </div>

            {calculatedElements.length ? (
              <div className="calculator-results-stack">
                <div className="calculator-results-metrics">
                  <div>
                    <span>Разделов рассчитано</span>
                    <strong>{calculatedElements.length}</strong>
                  </div>
                  <div>
                    <span>Позиции материалов</span>
                    <strong>{totalResultItems}</strong>
                  </div>
                  <div>
                    <span>Общая сумма</span>
                    <strong>{formatCurrency(activeCalculation?.totalCost)}</strong>
                  </div>
                </div>

                <div className="calculator-results-list">
                  {calculatedElements.map((element) => (
                    <article key={element.id || element.elementType} className="calculator-result-card">
                      <div className="calculator-result-headline">
                        <div>
                          <strong>{getElementLabel(element.elementType)}</strong>
                          <small>{element.resultItems.length} позиций материалов</small>
                        </div>
                        <span>{formatCurrency(element.totalCost)}</span>
                      </div>

                      <div className="calculator-result-items">
                        {element.resultItems.slice(0, 4).map((item, index) => (
                          <div key={`${element.elementType}-${item.materialName || item.section}-${index}`}>
                            <span>{item.materialName || item.section || 'Материал без названия'}</span>
                            <strong>
                              {formatQuantity(item.quantity)} {item.unit}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="cabinet-empty-state compact">
                <strong>Результаты ещё не сформированы</strong>
                <p>Создайте расчёт, затем запустите каркас или фундамент. После этого итог появится в этом блоке.</p>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

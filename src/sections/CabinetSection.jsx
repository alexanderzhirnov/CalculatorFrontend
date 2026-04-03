import React, { useMemo } from 'react';
import {
  SUPPORT_CONTACTS,
  formatDate,
  formatDateTime,
  getCalculationTitle,
  getClientName,
  getLatestCalculation,
  getStatusMeta
} from '../utils/dashboard';

function CabinetPulseCard({ label, value, hint }) {
  return (
    <article className="cabinet-pulse-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

export default function CabinetSection(props) {
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    loadClients,
    loadCabinet,
    cabinetCalcs,
    updateCalcStatus,
    copyCalculation,
    deleteCalculation
  } = props;

  const selectedClient = useMemo(
    () => clients.find((client) => String(client.id) === String(selectedClientId)),
    [clients, selectedClientId]
  );

  const latestCalculation = useMemo(() => getLatestCalculation(cabinetCalcs), [cabinetCalcs]);

  const cabinetPulse = useMemo(() => {
    const statusCounters = cabinetCalcs.reduce(
      (accumulator, calculation) => {
        accumulator.total += 1;

        if (calculation.status === 'ACTUAL') {
          accumulator.actual += 1;
        }

        if (calculation.status === 'CONTRACT_SIGNED') {
          accumulator.signed += 1;
        }

        return accumulator;
      },
      { total: 0, actual: 0, signed: 0 }
    );

    return [
      {
        label: 'Расчётов в кабинете',
        value: statusCounters.total,
        hint: 'Количество карточек по выбранному клиенту.'
      },
      {
        label: 'Актуальных',
        value: statusCounters.actual,
        hint: 'Быстрый контроль активных коммерческих расчётов.'
      },
      {
        label: 'Договоров',
        value: statusCounters.signed,
        hint: 'Подписанные сделки вынесены отдельно для дальнейшей детализации.'
      },
      {
        label: 'Последний объект',
        value: latestCalculation ? getCalculationTitle(latestCalculation) : 'Пока нет расчётов',
        hint: latestCalculation ? formatDateTime(latestCalculation.createdAt) : 'Появится после первого расчёта.'
      }
    ];
  }, [cabinetCalcs, latestCalculation]);

  return (
    <section className="cabinet-shell">
      <div className="cabinet-top-grid">
        <article className="card cabinet-overview-card">
          <p className="pill">Личный кабинет</p>
          <h2>Клиенты и история расчётов</h2>
          <p className="cabinet-intro-copy">
            Здесь собрана персональная часть данных: история объектов, текущие статусы и краткая сводка по выбранному
            клиенту. Структура подготовлена так, чтобы позже сюда можно было безболезненно добавить CRM-статусы,
            суммы, дедлайны и ответственных.
          </p>

          <div className="cabinet-pulse-grid">
            {cabinetPulse.map((item) => (
              <CabinetPulseCard key={item.label} label={item.label} value={item.value} hint={item.hint} />
            ))}
          </div>
        </article>

        <aside className="card cabinet-client-card">
          <div className="cabinet-client-head">
            <p className="pill subtle">Карточка клиента</p>
            <button type="button" className="ghost" onClick={loadClients}>
              Обновить список
            </button>
          </div>

          {selectedClient ? (
            <div className="cabinet-client-details">
              <div>
                <span>Клиент</span>
                <strong>{getClientName(selectedClient)}</strong>
              </div>
              <div>
                <span>Телефон</span>
                <strong>{selectedClient.phone || 'Телефон не заполнен'}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{selectedClient.email || 'Email не заполнен'}</strong>
              </div>
              <div>
                <span>Адрес</span>
                <strong>{selectedClient.address || 'Адрес клиента не заполнен'}</strong>
              </div>
              <div>
                <span>Добавлен</span>
                <strong>{formatDate(selectedClient.createdAt)}</strong>
              </div>
            </div>
          ) : (
            <div className="cabinet-empty-state">
              <strong>Клиент пока не выбран</strong>
              <p>Если база ещё не подключена, загрузите список или позже замените этот блок на данные из CRM.</p>
            </div>
          )}

          <div className="cabinet-support-card">
            <span>Техподдержка</span>
            <strong>{SUPPORT_CONTACTS.phone}</strong>
            <small>{SUPPORT_CONTACTS.telegram}</small>
          </div>
        </aside>
      </div>

      <article className="card cabinet-history-card">
        <div className="cabinet-history-head">
          <div>
            <p className="pill subtle">История</p>
            <h3>Расчёты клиента</h3>
          </div>

          <div className="cabinet-filters">
            <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)}>
              {!clients.length && <option value="">Сначала загрузите клиентов</option>}
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {getClientName(client)}
                </option>
              ))}
            </select>

            <button type="button" onClick={loadCabinet}>
              Поиск
            </button>
          </div>
        </div>

        <div className="cabinet-history-list">
          {cabinetCalcs.length ? (
            cabinetCalcs.map((calc) => {
              const statusMeta = getStatusMeta(calc.status);

              return (
                <article key={calc.id} className="cabinet-history-item">
                  <div className="cabinet-history-copy">
                    <div className="cabinet-history-title-row">
                      <h4>{getCalculationTitle(calc)}</h4>
                      <span className={`status-pill tone-${statusMeta.tone}`}>{statusMeta.label}</span>
                    </div>

                    <div className="cabinet-history-meta">
                      <span>Создан: {formatDateTime(calc.createdAt)}</span>
                      <span>
                        Цены зафиксированы до:{' '}
                        {calc.pricesFixedUntil ? formatDateTime(calc.pricesFixedUntil) : 'дата не указана'}
                      </span>
                    </div>
                  </div>

                  <div className="cabinet-history-actions">
                    <button type="button" className="ghost" onClick={() => updateCalcStatus(calc.id, 'ACTUAL')}>
                      Актуален
                    </button>
                    <button type="button" className="ghost" onClick={() => updateCalcStatus(calc.id, 'NOT_ACTUAL')}>
                      Не актуален
                    </button>
                    <button type="button" className="ghost" onClick={() => updateCalcStatus(calc.id, 'CONTRACT_SIGNED')}>
                      Договор
                    </button>
                    <button type="button" className="ghost" onClick={() => copyCalculation(calc.id)}>
                      Копия
                    </button>
                    <button type="button" className="danger" onClick={() => deleteCalculation(calc.id)}>
                      Удалить
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="cabinet-empty-state">
              <strong>История пока пустая</strong>
              <p>После выбора клиента и запуска расчётов здесь появятся карточки объектов, статусов и сроков.</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

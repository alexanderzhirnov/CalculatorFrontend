export const BRAND_NAME = 'СтройРасчёт';

export const SUPPORT_CONTACTS = {
  phone: '+7 (900) 000-00-00',
  telegram: '@AlienceTest_bot',
  telegramLink: 'https://t.me/AlienceTest_bot',
  telegramChatId: '-4110129036',
  telegramBotToken: '6390722480:AAFt8bwcszfWA337NRju7cTpuZzl58H1zvw',
  telegramWebLink: 'https://web.telegram.org/a/#-4110129036',
  schedule: 'Пн-Пт, 09:00-18:00',
  note: 'Обращения отправляются прямо в чат поддержки.'
};

export const CALCULATION_STATUS_META = {
  ACTUAL: { label: 'Актуален', tone: 'actual' },
  NOT_ACTUAL: { label: 'Не актуален', tone: 'muted' },
  CONTRACT_SIGNED: { label: 'Договор подписан', tone: 'success' }
};

export function getStatusMeta(status) {
  return CALCULATION_STATUS_META[status] || { label: status || 'Статус уточняется', tone: 'muted' };
}

export function getClientName(client) {
  if (!client) return 'Клиент не выбран';

  const fullName = [client.lastName, client.firstName, client.patronymic].filter(Boolean).join(' ');
  return fullName || 'Клиент без имени';
}

export function formatDate(value, options = {}) {
  if (!value) return 'Дата уточняется';

  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      ...options
    }).format(new Date(value));
  } catch {
    return 'Дата уточняется';
  }
}

export function formatDateTime(value) {
  return formatDate(value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getCalculationTitle(calc) {
  return calc?.constructionAddress?.trim() || 'Адрес объекта не указан';
}

export function flattenClientCalculations(clients = []) {
  return clients
    .flatMap((client) =>
      (client.calculations || []).map((calculation) => ({
        ...calculation,
        clientId: client.id,
        clientName: getClientName(client)
      }))
    )
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

export function getLatestCalculation(calculations = []) {
  return [...calculations].sort(
    (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  )[0];
}

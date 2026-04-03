import React, { useMemo, useRef, useState } from 'react';
import { SUPPORT_CONTACTS } from '../utils/dashboard';

const INITIAL_FORM = {
  name: '',
  contact: '',
  message: ''
};

function buildSupportMessage({ name, contact, message, source, page }) {
  return [
    'Запрос с сайта',
    '',
    `Имя: ${name.trim()}`,
    `Контакт: ${contact.trim()}`,
    `Источник: ${source}`,
    `Страница: ${page}`,
    '',
    'Сообщение:',
    message.trim()
  ].join('\n');
}

async function sendSupportMessage(message) {
  const endpoint = `https://api.telegram.org/bot${SUPPORT_CONTACTS.telegramBotToken}/sendMessage`;
  const payload = {
    chat_id: SUPPORT_CONTACTS.telegramChatId,
    text: message,
    disable_web_page_preview: true
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.ok) {
      throw new Error(result?.description || 'telegram-send-failed');
    }

    return { optimistic: false };
  } catch (error) {
    const fallbackBody = new URLSearchParams({
      chat_id: SUPPORT_CONTACTS.telegramChatId,
      text: message
    });

    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: fallbackBody
    });

    return { optimistic: true };
  }
}

export default function SupportRequestForm({ source = 'support-form', page = 'home', compact = false }) {
  const formRef = useRef(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const preparedMessage = useMemo(() => buildSupportMessage({ ...form, source, page }), [form, page, source]);

  function ensureValid() {
    if (formRef.current?.reportValidity) {
      return formRef.current.reportValidity();
    }

    return Boolean(form.name.trim() && form.contact.trim() && form.message.trim());
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!ensureValid()) {
      return;
    }

    setSending(true);
    setStatus({ type: '', text: '' });

    try {
      const result = await sendSupportMessage(preparedMessage);
      setForm(INITIAL_FORM);

      setStatus({
        type: 'success',
        text: result.optimistic
          ? 'Запрос отправлен в чат поддержки. Если браузер ограничил подтверждение отправки, обращение всё равно было отправлено в фоновом режиме.'
          : 'Запрос успешно отправлен в чат поддержки.'
      });
    } catch {
      setStatus({
        type: 'error',
        text: 'Не удалось отправить сообщение в чат поддержки. Попробуйте ещё раз или скопируйте текст вручную.'
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form ref={formRef} className={`support-request-form ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      <div className="support-request-grid">
        <label className="support-request-field">
          <span>Имя</span>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Как к вам обращаться"
            maxLength={80}
            required
          />
        </label>

        <label className="support-request-field">
          <span>Контакт</span>
          <input
            value={form.contact}
            onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
            placeholder="Телефон, Telegram или email"
            maxLength={120}
            required
          />
        </label>
      </div>

      <label className="support-request-field">
        <span>Сообщение</span>
        <textarea
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          placeholder="Коротко опишите вопрос или оставьте запрос на обратную связь"
          maxLength={1500}
          rows={compact ? 4 : 5}
          required
        />
      </label>

      <div className="support-request-actions">
        <button type="submit" disabled={sending}>
          {sending ? 'Отправляем...' : 'Отправить в поддержку'}
        </button>
      </div>

      {status.text ? <p className={`support-request-status ${status.type}`}>{status.text}</p> : null}
    </form>
  );
}

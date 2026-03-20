import React, { useMemo, useState } from 'react';

function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  }).format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
}

function ToolIcon({ type }) {
  if (type === 'facade') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M12 28 32 12l20 16v22a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2Z" />
        <path d="M24 52V36h16v16" />
        <path d="M20 30h24" />
      </svg>
    );
  }

  if (type === 'concrete') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="m32 10 18 10v24L32 54 14 44V20z" />
        <path d="m32 10 18 10-18 10-18-10z" />
        <path d="M32 30v24" />
      </svg>
    );
  }

  if (type === 'sheet') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="14" y="14" width="36" height="36" rx="4" />
        <path d="M24 14v36M14 26h36M14 38h36" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 10c7.2 0 13 5.8 13 13 0 3.5-1.4 6.7-3.6 9.1L32 54l-9.4-21.9A12.8 12.8 0 0 1 19 23c0-7.2 5.8-13 13-13Z" />
      <path d="M32 18v10M26 28h12M24 36h16" />
    </svg>
  );
}

function ResultStat({ label, value, accent }) {
  return (
    <div className={`tool-result-stat ${accent ? 'accent' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FacadeToolCard() {
  const [width, setWidth] = useState(9.6);
  const [height, setHeight] = useState(3.1);
  const [price, setPrice] = useState(980);

  const result = useMemo(() => {
    const area = width * height;
    const reserveArea = area * 1.08;
    const total = reserveArea * price;

    return {
      area,
      reserveArea,
      total
    };
  }, [height, price, width]);

  return (
    <article className="tool-card tool-card-facade">
      <div className="tool-card-head">
        <div className="tool-icon-wrap">
          <ToolIcon type="facade" />
        </div>
        <div>
          <p>Фасад</p>
          <h3>Площадь и бюджет</h3>
        </div>
      </div>

      <div className="tool-input-grid">
        <label>
          <span>Ширина, м</span>
          <input type="number" min="1" step="0.1" value={width} onChange={(event) => setWidth(Number(event.target.value))} />
        </label>
        <label>
          <span>Высота, м</span>
          <input type="number" min="1" step="0.1" value={height} onChange={(event) => setHeight(Number(event.target.value))} />
        </label>
        <label className="full">
          <span>Цена за м²</span>
          <input type="number" min="100" step="10" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
        </label>
      </div>

      <div className="tool-result-grid">
        <ResultStat label="Чистая площадь" value={`${formatNumber(result.area)} м²`} accent />
        <ResultStat label="С запасом" value={`${formatNumber(result.reserveArea)} м²`} />
        <ResultStat label="Смета" value={formatCurrency(result.total)} />
      </div>
    </article>
  );
}

function ConcreteToolCard() {
  const [length, setLength] = useState(11);
  const [width, setWidth] = useState(8);
  const [depth, setDepth] = useState(30);

  const result = useMemo(() => {
    const volume = length * width * (depth / 100);
    const mixers = Math.max(1, Math.ceil(volume / 7));
    const budget = volume * 5600;

    return {
      volume,
      mixers,
      budget
    };
  }, [depth, length, width]);

  return (
    <article className="tool-card tool-card-concrete">
      <div className="tool-card-head">
        <div className="tool-icon-wrap">
          <ToolIcon type="concrete" />
        </div>
        <div>
          <p>Бетон</p>
          <h3>Объём под плиту</h3>
        </div>
      </div>

      <div className="tool-input-grid">
        <label>
          <span>Длина, м</span>
          <input type="number" min="1" step="0.1" value={length} onChange={(event) => setLength(Number(event.target.value))} />
        </label>
        <label>
          <span>Ширина, м</span>
          <input type="number" min="1" step="0.1" value={width} onChange={(event) => setWidth(Number(event.target.value))} />
        </label>
        <label className="full">
          <span>Толщина, см</span>
          <input type="number" min="5" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} />
        </label>
      </div>

      <div className="tool-result-grid">
        <ResultStat label="Объём" value={`${formatNumber(result.volume, 2)} м³`} accent />
        <ResultStat label="Миксеры" value={`${result.mixers} шт`} />
        <ResultStat label="Смета" value={formatCurrency(result.budget)} />
      </div>
    </article>
  );
}

function SheetToolCard() {
  const [roomLength, setRoomLength] = useState(6.8);
  const [roomWidth, setRoomWidth] = useState(5.2);
  const [reserve, setReserve] = useState(10);

  const result = useMemo(() => {
    const area = roomLength * roomWidth;
    const actualArea = area * (1 + reserve / 100);
    const sheets = Math.ceil(actualArea / 3.125);
    const budget = sheets * 890;

    return {
      area,
      sheets,
      budget
    };
  }, [reserve, roomLength, roomWidth]);

  return (
    <article className="tool-card tool-card-sheet">
      <div className="tool-card-head">
        <div className="tool-icon-wrap">
          <ToolIcon type="sheet" />
        </div>
        <div>
          <p>OSB</p>
          <h3>Листы на пол</h3>
        </div>
      </div>

      <div className="tool-input-grid">
        <label>
          <span>Длина, м</span>
          <input type="number" min="1" step="0.1" value={roomLength} onChange={(event) => setRoomLength(Number(event.target.value))} />
        </label>
        <label>
          <span>Ширина, м</span>
          <input type="number" min="1" step="0.1" value={roomWidth} onChange={(event) => setRoomWidth(Number(event.target.value))} />
        </label>
        <label className="full">
          <span>Запас, %</span>
          <input type="number" min="0" max="30" step="1" value={reserve} onChange={(event) => setReserve(Number(event.target.value))} />
        </label>
      </div>

      <div className="tool-result-grid">
        <ResultStat label="Площадь" value={`${formatNumber(result.area)} м²`} accent />
        <ResultStat label="Листы" value={`${result.sheets} шт`} />
        <ResultStat label="Смета" value={formatCurrency(result.budget)} />
      </div>
    </article>
  );
}

function InsulationToolCard() {
  const [area, setArea] = useState(124);
  const [thickness, setThickness] = useState(150);
  const [packVolume, setPackVolume] = useState(0.6);

  const result = useMemo(() => {
    const volume = area * (thickness / 1000);
    const packs = Math.ceil(volume / packVolume);
    const budget = packs * 3150;

    return {
      volume,
      packs,
      budget
    };
  }, [area, packVolume, thickness]);

  return (
    <article className="tool-card tool-card-insulation">
      <div className="tool-card-head">
        <div className="tool-icon-wrap">
          <ToolIcon type="insulation" />
        </div>
        <div>
          <p>Утепление</p>
          <h3>Объём и упаковки</h3>
        </div>
      </div>

      <div className="tool-input-grid">
        <label>
          <span>Площадь, м²</span>
          <input type="number" min="1" step="1" value={area} onChange={(event) => setArea(Number(event.target.value))} />
        </label>
        <label>
          <span>Толщина, мм</span>
          <input type="number" min="50" step="10" value={thickness} onChange={(event) => setThickness(Number(event.target.value))} />
        </label>
        <label className="full">
          <span>Объём упаковки, м³</span>
          <input type="number" min="0.1" step="0.1" value={packVolume} onChange={(event) => setPackVolume(Number(event.target.value))} />
        </label>
      </div>

      <div className="tool-result-grid">
        <ResultStat label="Объём" value={`${formatNumber(result.volume, 2)} м³`} accent />
        <ResultStat label="Упаковки" value={`${result.packs} шт`} />
        <ResultStat label="Смета" value={formatCurrency(result.budget)} />
      </div>
    </article>
  );
}

export default function QuickToolsSection() {
  return (
    <section className="tool-suite">
      <div className="tool-suite-head">
        <p className="pill">Быстрые расчёты</p>
        <h2>Четыре живых инструмента прямо на странице</h2>
      </div>

      <div className="tool-suite-grid">
        <FacadeToolCard />
        <ConcreteToolCard />
        <SheetToolCard />
        <InsulationToolCard />
      </div>
    </section>
  );
}

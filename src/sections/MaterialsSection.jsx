import React, { useEffect, useMemo, useRef, useState } from 'react';
import wood100Image from '../../media/wood_50_100_3000.png';
import wood150Image from '../../media/wood_50_150_3000.png';
import wood200Image from '../../media/wood_50_200_3000.png';
import osbImage from '../../media/OSB_9.png';
import knaufImage from '../../media/Knauf.png';
import technonikolImage from '../../media/texnikol.png';
import ecoverImage from '../../media/ecover.png';
import facadeImage from '../../media/FASAD.png';
import membraneImage from '../../media/ondyitis.png';
import vaporImage from '../../media/PAROISOLATE.png';
import pilesImage from '../../media/svai.png';
import concreteImage from '../../media/Beton.png';
import rebarImage from '../../media/armatura.png';

const MATERIAL_VISUALS = {
  timber100: { id: 'timber100', category: 'Пиломатериалы', accent: 'Каркас', image: wood100Image, tone: 'wood' },
  timber150: { id: 'timber150', category: 'Пиломатериалы', accent: 'Каркас', image: wood150Image, tone: 'wood' },
  timber200: { id: 'timber200', category: 'Пиломатериалы', accent: 'Каркас', image: wood200Image, tone: 'wood' },
  sheet: { id: 'sheet', category: 'OSB', accent: 'Листы', image: osbImage, tone: 'sheet' },
  knauf: { id: 'knauf', category: 'Утепление', accent: 'Knauf', image: knaufImage, tone: 'light' },
  technonikol: { id: 'technonikol', category: 'Утепление', accent: 'Технониколь', image: technonikolImage, tone: 'light' },
  ecover: { id: 'ecover', category: 'Утепление', accent: 'Эковер', image: ecoverImage, tone: 'light' },
  facade: { id: 'facade', category: 'Утепление', accent: 'Фасад', image: facadeImage, tone: 'light' },
  membrane: { id: 'membrane', category: 'Мембраны', accent: 'Защита', image: membraneImage, tone: 'light' },
  vapor: { id: 'vapor', category: 'Пароизоляция', accent: 'Плёнка', image: vaporImage, tone: 'light' },
  piles: { id: 'piles', category: 'Сваи', accent: 'Фундамент', image: pilesImage, tone: 'light' },
  concrete: { id: 'concrete', category: 'Бетон', accent: 'Смесь', image: concreteImage, tone: 'light' },
  rebar: { id: 'rebar', category: 'Арматура', accent: 'Металл', image: rebarImage, tone: 'light' }
};

function getMaterialVisual(name = '') {
  const value = name.toLowerCase();

  if (value.includes('50*100')) return MATERIAL_VISUALS.timber100;
  if (value.includes('50*150')) return MATERIAL_VISUALS.timber150;
  if (value.includes('50*200') || value.includes('50*250') || value.includes('50*300')) return MATERIAL_VISUALS.timber200;
  if (value.includes('доска') || value.includes('брус')) return MATERIAL_VISUALS.timber150;
  if (value.includes('osb')) return MATERIAL_VISUALS.sheet;
  if (value.includes('кнауф')) return MATERIAL_VISUALS.knauf;
  if (value.includes('технониколь')) return MATERIAL_VISUALS.technonikol;
  if (value.includes('эковер')) return MATERIAL_VISUALS.ecover;
  if (value.includes('фасад')) return MATERIAL_VISUALS.facade;
  if (value.includes('ондутис')) return MATERIAL_VISUALS.membrane;
  if (value.includes('паро')) return MATERIAL_VISUALS.vapor;
  if (value.includes('ветро') || value.includes('гидро') || value.includes('мембран')) return MATERIAL_VISUALS.membrane;
  if (value.includes('сваи')) return MATERIAL_VISUALS.piles;
  if (value.includes('арматура')) return MATERIAL_VISUALS.rebar;
  if (/^м\d+/i.test(value) || value.includes('(в')) return MATERIAL_VISUALS.concrete;

  return MATERIAL_VISUALS.concrete;
}

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export default function MaterialsSection(props) {
  const {
    authenticated,
    loadingMaterials,
    loadMaterials,
    materialFilter,
    setMaterialFilter,
    materials,
    cart,
    onAddToCart,
    onRemoveFromCart
  } = props;

  const [activeCategory, setActiveCategory] = useState('all');
  const resultsRef = useRef(null);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.currentPrice || 0), 0),
    [cart]
  );

  const cartEntries = useMemo(
    () => cart.map((item, index) => ({ item, index })).reverse(),
    [cart]
  );

  const searchMatchedMaterials = useMemo(() => {
    const query = materialFilter.toLowerCase().trim();
    return query ? materials.filter((material) => `${material.name} ${material.unit || ''}`.toLowerCase().includes(query)) : materials;
  }, [materialFilter, materials]);

  const categorySummary = useMemo(() => {
    const groups = searchMatchedMaterials.reduce((acc, material) => {
      const visual = getMaterialVisual(material.name);

      if (!acc[visual.category]) {
        acc[visual.category] = 0;
      }

      acc[visual.category] += 1;
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [searchMatchedMaterials]);

  const filteredMaterials = useMemo(() => {
    if (activeCategory === 'all') return searchMatchedMaterials;
    return searchMatchedMaterials.filter((material) => getMaterialVisual(material.name).category === activeCategory);
  }, [activeCategory, searchMatchedMaterials]);

  useEffect(() => {
    if (activeCategory === 'all') return;

    const categoryExists = categorySummary.some((theme) => theme.category === activeCategory);
    if (!categoryExists) {
      setActiveCategory('all');
    }
  }, [activeCategory, categorySummary]);

  useEffect(() => {
    if (activeCategory === 'all' || !filteredMaterials.length) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      const firstCard = resultsRef.current?.querySelector('.material-showcase-card');
      firstCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeCategory, filteredMaterials.length]);

  return (
    <section className={`materials-shell ${!authenticated ? 'locked' : ''}`}>
      {!authenticated && <div className="locked-note">Требуется вход в систему.</div>}

      <div className="materials-top-grid">
        <article className="card materials-hero-card">
          <div className="materials-hero-copy compact">
            <p className="pill">Материалы</p>
            <h2>Каталог</h2>

            <div className="materials-toolbar">
              <button type="button" onClick={loadMaterials} disabled={loadingMaterials}>
                {loadingMaterials ? 'Обновляем...' : 'Обновить'}
              </button>

              <label className="search-shell">
                <span>Поиск</span>
                <input
                  value={materialFilter}
                  onChange={(event) => setMaterialFilter(event.target.value)}
                  placeholder="OSB, бетон, арматура"
                />
              </label>
            </div>
          </div>

          <div className="materials-overview-grid compact">
            <div className="materials-metric-card">
              <span>Позиций</span>
              <strong>{materials.length || '—'}</strong>
            </div>

            <div className="materials-metric-card">
              <span>Найдено</span>
              <strong>{filteredMaterials.length}</strong>
            </div>

            <div className="materials-metric-card">
              <span>Групп</span>
              <strong>{categorySummary.length || '—'}</strong>
            </div>
          </div>
        </article>

        <aside className="card materials-cart-card compact">
          <div className="materials-cart-head">
            <p className="pill subtle">Корзина</p>
            <h3>{cart.length} позиций</h3>
          </div>

          <div className="cart-metrics">
            <div>
              <span>Сумма</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
          </div>

          <div className="cart-preview-list compact">
            {cartEntries.length ? (
              cartEntries.map(({ item, index }) => (
                <div className="cart-preview-item" key={`cart-${index}-${item.id}-${item.name}`}>
                  <div className="cart-preview-main">
                    <div>
                      <strong>{item.name}</strong>
                      <small>{getMaterialVisual(item.name).category}</small>
                    </div>
                    <span>{formatPrice(item.currentPrice)}</span>
                  </div>
                  <button className="ghost cart-remove-btn" type="button" onClick={() => onRemoveFromCart(index)}>
                    Убрать
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-state-copy">Пусто</p>
            )}
          </div>
        </aside>
      </div>

      <div className="materials-tag-row">
        {categorySummary.length ? (
          <>
            <button
              type="button"
              className={`materials-tag ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <span>Все материалы</span>
              <strong>{searchMatchedMaterials.length}</strong>
            </button>

            {categorySummary.map((theme) => (
              <button
                type="button"
                className={`materials-tag ${activeCategory === theme.category ? 'active' : ''}`}
                key={theme.category}
                onClick={() => setActiveCategory((prev) => (prev === theme.category ? 'all' : theme.category))}
              >
                <span>{theme.category}</span>
                <strong>{theme.count}</strong>
              </button>
            ))}
          </>
        ) : (
          <div className="materials-tag muted">Нет данных</div>
        )}
      </div>

      <div ref={resultsRef} className="materials-card-grid">
        {filteredMaterials.length ? (
          filteredMaterials.map((material) => {
            const visual = getMaterialVisual(material.name);

            return (
              <article className={`material-showcase-card tone-${visual.tone}`} key={material.id} data-material-category={visual.category}>
                <div className="material-showcase-visual">
                  <div className="material-showcase-topline">
                    <span className="material-visual-badge">{visual.accent}</span>
                    <span className="material-visual-unit">{material.unit || 'ед.'}</span>
                  </div>
                  <img className="material-showcase-product" src={visual.image} alt={material.name} />
                </div>

                <div className="material-showcase-body compact">
                  <div className="material-showcase-head">
                    <p>{visual.category}</p>
                    <strong>{material.name}</strong>
                  </div>

                  <div className="material-showcase-footer">
                    <div className="material-price-block">
                      <span>Цена</span>
                      <strong>{formatPrice(material.currentPrice)}</strong>
                    </div>

                    <button type="button" onClick={() => onAddToCart(material)}>
                      В корзину
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <article className="card materials-empty-card">
            <p className="pill subtle">Материалы</p>
            <h3>Ничего не найдено</h3>
            <button type="button" onClick={loadMaterials} disabled={loadingMaterials}>
              {loadingMaterials ? 'Загружаем...' : 'Обновить каталог'}
            </button>
          </article>
        )}
      </div>
    </section>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import HomeSection, { HERO_IMAGES } from './sections/HomeSection';
import MaterialsSection from './sections/MaterialsSection';
import { API_BASE, authHeaders, refreshSession, safeStorage } from './services/api';

export default function App() {
  const [tab, setTab] = useState('home');
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [message, setMessage] = useState('');

  const [auth, setAuth] = useState({
    login: safeStorage.get('login', ''),
    password: '',
    authInfo: safeStorage.get('login', 'guest') || 'guest',
    authenticated: Boolean(safeStorage.get('accessToken', ''))
  });

  const [registerForm, setRegisterForm] = useState({ login: '', password: '', firstName: '', lastName: '' });
  const [materialFilter, setMaterialFilter] = useState('');
  const [materials, setMaterials] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [address, setAddress] = useState('г. Москва, ул. Строителей, 9');
  const [cart, setCart] = useState(JSON.parse(safeStorage.get('cart', '[]') || '[]'));
  const [calcId, setCalcId] = useState('');
  const [cabinetCalcs, setCabinetCalcs] = useState([]);
  const [createClientForm, setCreateClientForm] = useState({ lastName: '', firstName: '', patronymic: '', phone: '', email: '', address: '' });
  const [frameParams, setFrameParams] = useState({
    floors: 1,
    floorHeight: 2.8,
    perimeter: 48,
    foundationArea: 120,
    innerWallLength: 36,
    extWallThickness: 'MM_150',
    intWallThickness: 'MM_100',
    ceilingThickness: 'MM_200'
  });
  const [foundationParams, setFoundationParams] = useState({
    externalPerimeter: 48,
    innerWallLength: 36,
    pileType: 'Бетонные сваи 200*200*3000',
    concreteGrade: 'М300 (В22.5)'
  });

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastY && currentY > 64;
      setCompactHeader(scrollingDown);
      if (!scrollingDown) setMenuOpen(false);
      lastY = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    safeStorage.set('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!auth.authenticated && !['home', 'auth'].includes(tab)) {
      setTab('home');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [auth.authenticated, tab]);

  const visibleMaterials = useMemo(() => {
    const query = materialFilter.toLowerCase().trim();
    return query ? materials.filter((material) => `${material.name} ${material.unit || ''}`.toLowerCase().includes(query)) : materials;
  }, [materialFilter, materials]);

  async function apiFetch(path, options = {}, retry = true) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...(options.headers || {}), ...authHeaders() }
    });

    if (response.status === 401 && retry) {
      const refreshed = await refreshSession(setAuth);
      if (refreshed) return apiFetch(path, options, false);
      logout(false);
    }

    return response;
  }

  function navigateToTab(nextTab) {
    setTab(nextTab);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function logout(withMsg = true) {
    safeStorage.remove('accessToken');
    safeStorage.remove('refreshToken');
    safeStorage.remove('login');
    setAuth((prev) => ({ ...prev, login: '', password: '', authenticated: false, authInfo: 'guest' }));
    setClients([]);
    setCabinetCalcs([]);
    if (withMsg) setMessage('Сессия завершена.');
  }

  async function finishAuth(data, successMessage) {
    safeStorage.set('accessToken', data.accessToken);
    safeStorage.set('refreshToken', data.refreshToken);
    safeStorage.set('login', data.login);

    setAuth((prev) => ({
      ...prev,
      login: data.login,
      password: '',
      authenticated: true,
      authInfo: data.login
    }));

    setAuthMode('login');
    navigateToTab('home');
    setMessage(successMessage);
    await loadClients();
  }

  async function onLogin(event) {
    event.preventDefault();
    setLoadingAuth(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: auth.login, password: auth.password })
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      await finishAuth(data, `Вы вошли как ${data.login}.`);
    } catch {
      setMessage('Не удалось войти. Проверьте логин и пароль.');
    } finally {
      setLoadingAuth(false);
    }
  }

  async function onRegister(event) {
    event.preventDefault();
    setLoadingRegister(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: registerForm.login.trim(),
          password: registerForm.password,
          firstName: registerForm.firstName.trim() || null,
          lastName: registerForm.lastName.trim() || null
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Ошибка регистрации.');
      }

      const data = await response.json();
      setRegisterForm({ login: '', password: '', firstName: '', lastName: '' });
      await finishAuth(data, `Аккаунт ${data.login} готов к работе.`);
    } catch (error) {
      setMessage(error.message || 'Не удалось зарегистрироваться.');
    } finally {
      setLoadingRegister(false);
    }
  }

  async function loadMaterials() {
    setLoadingMaterials(true);

    try {
      const response = await apiFetch('/materials');
      if (!response.ok) throw new Error();

      const data = await response.json();
      setMaterials(data);
      setMessage(`Материалы загружены: ${data.length}`);
    } catch {
      setMessage('Не удалось загрузить материалы.');
    } finally {
      setLoadingMaterials(false);
    }
  }

  async function loadClients() {
    const response = await apiFetch('/clients');
    if (!response.ok) {
      setMessage('Не удалось загрузить клиентов.');
      return;
    }

    const data = await response.json();
    setClients(data);
    if (data[0] && !selectedClientId) setSelectedClientId(String(data[0].id));
  }

  async function createClient() {
    const response = await apiFetch('/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createClientForm)
    });

    if (!response.ok) {
      setMessage('Ошибка создания клиента.');
      return;
    }

    setCreateClientForm({ lastName: '', firstName: '', patronymic: '', phone: '', email: '', address: '' });
    setMessage('Клиент создан.');
    await loadClients();
  }

  async function createCalculation() {
    if (!selectedClientId) {
      setMessage('Сначала выберите клиента.');
      return;
    }

    const response = await apiFetch(`/calculations/client/${selectedClientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ constructionAddress: address })
    });

    if (!response.ok) {
      setMessage('Не удалось создать расчёт.');
      return;
    }

    const data = await response.json();
    setCalcId(String(data.id));
    setMessage(`Расчёт #${data.id} создан.`);
  }

  async function postFrame() {
    if (!calcId) {
      setMessage('Укажите ID расчёта.');
      return;
    }

    const floorParams = {
      floorHeight: Number(frameParams.floorHeight),
      perimeter: Number(frameParams.perimeter),
      foundationArea: Number(frameParams.foundationArea),
      extWallThickness: frameParams.extWallThickness,
      innerWallLength: Number(frameParams.innerWallLength),
      intWallThickness: frameParams.intWallThickness,
      ceilingThickness: frameParams.ceilingThickness,
      windows: [{ width: 1.4, height: 1.4, count: 8 }],
      externalDoors: [{ width: 1, height: 2.1, count: 2 }],
      internalDoors: [{ width: 0.9, height: 2.1, count: 6 }]
    };

    const payload = {
      floors: Number(frameParams.floors),
      floorParamsList: Array.from({ length: Number(frameParams.floors) }, () => floorParams)
    };

    const response = await apiFetch(`/calculations/${calcId}/frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setMessage(response.ok ? 'Каркас рассчитан.' : 'Ошибка расчёта каркаса.');
  }

  async function postFoundation() {
    if (!calcId) {
      setMessage('Укажите ID расчёта.');
      return;
    }

    const response = await apiFetch(`/calculations/${calcId}/foundation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...foundationParams,
        externalPerimeter: Number(foundationParams.externalPerimeter),
        innerWallLength: Number(foundationParams.innerWallLength)
      })
    });

    setMessage(response.ok ? 'Фундамент рассчитан.' : 'Ошибка расчёта фундамента.');
  }

  async function loadCabinet() {
    if (!selectedClientId) {
      setMessage('Выберите клиента.');
      return;
    }

    const response = await apiFetch(`/calculations/client/${selectedClientId}`);
    if (!response.ok) {
      setMessage('Не удалось загрузить историю расчётов.');
      return;
    }

    setCabinetCalcs(await response.json());
  }

  async function updateCalcStatus(id, status) {
    const response = await apiFetch(`/calculations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      setMessage('Не удалось обновить статус.');
      return;
    }

    setMessage(`Статус #${id} обновлён.`);
    await loadCabinet();
  }

  async function copyCalculation(id) {
    const response = await apiFetch(`/calculations/${id}/copy`, { method: 'POST' });
    if (!response.ok) {
      setMessage('Не удалось скопировать расчёт.');
      return;
    }

    setMessage(`Расчёт #${id} скопирован.`);
    await loadCabinet();
  }

  async function deleteCalculation(id) {
    const response = await apiFetch(`/calculations/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setMessage('Не удалось удалить расчёт.');
      return;
    }

    setMessage(`Расчёт #${id} удалён.`);
    await loadCabinet();
  }

  function addToCart(material) {
    setCart((prev) => [...prev, material]);
    setMessage(`Материал «${material.name}» добавлен в корзину.`);
  }

  function removeFromCart(indexToRemove) {
    setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
    setMessage('Позиция удалена из корзины.');
  }

  function openTab(nextTab) {
    if (!auth.authenticated && !['home', 'auth'].includes(nextTab)) {
      setAuthMode('login');
      navigateToTab('auth');
      setMessage('Войдите, чтобы открыть раздел.');
      return;
    }

    navigateToTab(nextTab);

    if (nextTab === 'materials' && auth.authenticated && !materials.length && !loadingMaterials) {
      loadMaterials();
    }
  }

  return (
    <>
      <Header
        tab={tab}
        compactHeader={compactHeader}
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
        openTab={openTab}
        auth={auth}
        openAuthModal={() => openTab('auth')}
      />

      <main className={`main-with-header ${tab === 'auth' ? 'main-auth' : ''}`}>
        {tab === 'auth' && (
          <AuthPage
            auth={auth}
            authMode={authMode}
            setAuthMode={setAuthMode}
            loadingAuth={loadingAuth}
            loadingRegister={loadingRegister}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            setAuth={setAuth}
            onLogin={onLogin}
            onRegister={onRegister}
            onRefresh={async () => setMessage((await refreshSession(setAuth)) ? 'Сессия обновлена.' : 'Не удалось обновить сессию.')}
            onLogout={() => {
              logout(true);
              navigateToTab('home');
            }}
            onClose={() => navigateToTab('home')}
            onOpenTab={openTab}
          />
        )}

        {tab === 'home' && <HomeSection heroIndex={heroIndex} openTab={openTab} authenticated={auth.authenticated} />}

        {tab === 'materials' && auth.authenticated && (
          <MaterialsSection
            authenticated={auth.authenticated}
            loadingMaterials={loadingMaterials}
            loadMaterials={loadMaterials}
            materialFilter={materialFilter}
            setMaterialFilter={setMaterialFilter}
            materials={materials}
            visibleMaterials={visibleMaterials}
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
          />
        )}

        {tab === 'calculator' && auth.authenticated && (
          <section className="content-grid wide">
            <article className="card">
              <h3>Клиент и расчёт</h3>
              <div className="row">
                <button type="button" onClick={loadClients}>Загрузить клиентов</button>
                <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)}>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {`${client.lastName} ${client.firstName}`}
                    </option>
                  ))}
                </select>
              </div>
              <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Адрес строительства" />
              <button type="button" onClick={createCalculation}>Создать расчёт</button>
              <input value={calcId} onChange={(event) => setCalcId(event.target.value)} placeholder="ID расчёта" />
            </article>

            <article className="card">
              <h3>Каркас</h3>
              <div className="row">
                <label>Этажей</label>
                <input type="number" min="1" max="5" value={frameParams.floors} onChange={(event) => setFrameParams((prev) => ({ ...prev, floors: event.target.value }))} />
              </div>
              <div className="row">
                <label>Высота</label>
                <input type="number" value={frameParams.floorHeight} onChange={(event) => setFrameParams((prev) => ({ ...prev, floorHeight: event.target.value }))} />
              </div>
              <div className="row">
                <label>Периметр</label>
                <input type="number" value={frameParams.perimeter} onChange={(event) => setFrameParams((prev) => ({ ...prev, perimeter: event.target.value }))} />
              </div>
              <button type="button" onClick={postFrame}>Рассчитать каркас</button>
            </article>

            <article className="card">
              <h3>Фундамент</h3>
              <div className="row">
                <label>Периметр</label>
                <input type="number" value={foundationParams.externalPerimeter} onChange={(event) => setFoundationParams((prev) => ({ ...prev, externalPerimeter: event.target.value }))} />
              </div>
              <div className="row">
                <label>Внутр. стены</label>
                <input type="number" value={foundationParams.innerWallLength} onChange={(event) => setFoundationParams((prev) => ({ ...prev, innerWallLength: event.target.value }))} />
              </div>
              <button type="button" onClick={postFoundation}>Рассчитать фундамент</button>
            </article>
          </section>
        )}

        {tab === 'cabinet' && auth.authenticated && (
          <section className="content-grid wide">
            <article className="card">
              <h3>Новый клиент</h3>
              <div className="login-form">
                <input placeholder="Фамилия*" value={createClientForm.lastName} onChange={(event) => setCreateClientForm((prev) => ({ ...prev, lastName: event.target.value }))} />
                <input placeholder="Имя*" value={createClientForm.firstName} onChange={(event) => setCreateClientForm((prev) => ({ ...prev, firstName: event.target.value }))} />
                <input placeholder="Отчество" value={createClientForm.patronymic} onChange={(event) => setCreateClientForm((prev) => ({ ...prev, patronymic: event.target.value }))} />
                <input placeholder="Телефон" value={createClientForm.phone} onChange={(event) => setCreateClientForm((prev) => ({ ...prev, phone: event.target.value }))} />
                <input placeholder="Email" value={createClientForm.email} onChange={(event) => setCreateClientForm((prev) => ({ ...prev, email: event.target.value }))} />
                <input placeholder="Адрес" value={createClientForm.address} onChange={(event) => setCreateClientForm((prev) => ({ ...prev, address: event.target.value }))} />
                <button type="button" onClick={createClient}>Создать клиента</button>
              </div>
            </article>

            <article className="card">
              <h3>История расчётов</h3>
              <div className="row">
                <button type="button" onClick={loadClients}>Клиенты</button>
                <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)}>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {`${client.lastName} ${client.firstName}`}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={loadCabinet}>Обновить</button>
              </div>

              <div className="material-list">
                {cabinetCalcs.map((calc) => (
                  <div key={calc.id} className="material-item stack">
                    <div>
                      <strong>#{calc.id}</strong>
                      <p>{calc.constructionAddress || ''}</p>
                      <p>{calc.status || ''}</p>
                    </div>
                    <div className="status-actions">
                      <button type="button" onClick={() => updateCalcStatus(calc.id, 'ACTUAL')}>ACTUAL</button>
                      <button type="button" onClick={() => updateCalcStatus(calc.id, 'NOT_ACTUAL')}>NOT_ACTUAL</button>
                      <button type="button" onClick={() => updateCalcStatus(calc.id, 'CONTRACT_SIGNED')}>CONTRACT_SIGNED</button>
                      <button type="button" onClick={() => copyCalculation(calc.id)}>Копия</button>
                      <button type="button" className="danger" onClick={() => deleteCalculation(calc.id)}>Удалить</button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        )}

        {message ? <p className="result-msg">{message}</p> : null}
      </main>
    </>
  );
}

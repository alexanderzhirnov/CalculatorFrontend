import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import HomeSection, { HERO_IMAGES } from './sections/HomeSection';
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
  const [message, setMessage] = useState('Готово к работе. Войдите или зарегистрируйтесь для доступа к кабинету.');

  const [auth, setAuth] = useState({
    login: safeStorage.get('login', 'manager') || 'manager',
    password: 'password',
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
  const [frameParams, setFrameParams] = useState({ floors: 1, floorHeight: 2.8, perimeter: 48, foundationArea: 120, innerWallLength: 36, extWallThickness: 'MM_150', intWallThickness: 'MM_100', ceilingThickness: 'MM_200' });
  const [foundationParams, setFoundationParams] = useState({ externalPerimeter: 48, innerWallLength: 36, pileType: 'Бетонные сваи 200*200*3000', concreteGrade: 'М300 (В22.5)' });

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

  useEffect(() => { safeStorage.set('cart', JSON.stringify(cart)); }, [cart]);

  const visibleMaterials = useMemo(() => {
    const q = materialFilter.toLowerCase().trim();
    return q ? materials.filter((m) => `${m.name} ${m.unit || ''}`.toLowerCase().includes(q)) : materials;
  }, [materialFilter, materials]);

  async function apiFetch(path, options = {}, retry = true) {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...(options.headers || {}), ...authHeaders() } });
    if (response.status === 401 && retry) {
      const refreshed = await refreshSession(setAuth);
      if (refreshed) return apiFetch(path, options, false);
      logout(false);
    }
    return response;
  }

  function logout(withMsg = true) {
    safeStorage.remove('accessToken');
    safeStorage.remove('refreshToken');
    safeStorage.remove('login');
    setAuth((p) => ({ ...p, authenticated: false, authInfo: 'guest' }));
    setClients([]);
    setCabinetCalcs([]);
    if (withMsg) setMessage('Сессия завершена.');
  }

  async function onLogin(e) {
    e.preventDefault();
    setLoadingAuth(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: auth.login, password: auth.password }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      safeStorage.set('accessToken', data.accessToken);
      safeStorage.set('refreshToken', data.refreshToken);
      safeStorage.set('login', data.login);
      setAuth((p) => ({ ...p, authenticated: true, authInfo: data.login }));
      setMessage(`Вы вошли как ${data.login}.`);
      await loadClients();
    } catch {
      setMessage('Не удалось войти. Проверьте login/password.');
    } finally { setLoadingAuth(false); }
  }

  async function onRegister(e) {
    e.preventDefault();
    setLoadingRegister(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: registerForm.login.trim(), password: registerForm.password, firstName: registerForm.firstName.trim() || null, lastName: registerForm.lastName.trim() || null })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Ошибка регистрации.');
      }
      const data = await res.json();
      safeStorage.set('accessToken', data.accessToken);
      safeStorage.set('refreshToken', data.refreshToken);
      safeStorage.set('login', data.login);
      setAuth((p) => ({ ...p, authenticated: true, authInfo: data.login, login: data.login, password: '' }));
      setRegisterForm({ login: '', password: '', firstName: '', lastName: '' });
      setMessage(`Регистрация успешна. Вы вошли как ${data.login}.`);
      await loadClients();
    } catch (error) { setMessage(error.message || 'Не удалось зарегистрироваться.');
    } finally { setLoadingRegister(false); }
  }

  async function loadMaterials() {
    setLoadingMaterials(true);
    try {
      const res = await apiFetch('/materials');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMaterials(data);
      setMessage(`Материалы загружены: ${data.length}`);
    } catch { setMessage('Не удалось загрузить материалы.');
    } finally { setLoadingMaterials(false); }
  }

  async function loadClients() {
    const res = await apiFetch('/clients');
    if (!res.ok) return setMessage('Не удалось загрузить клиентов.');
    const data = await res.json();
    setClients(data);
    if (data[0] && !selectedClientId) setSelectedClientId(String(data[0].id));
  }

  async function createClient() {
    const res = await apiFetch('/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createClientForm) });
    if (!res.ok) return setMessage('Ошибка создания клиента.');
    setCreateClientForm({ lastName: '', firstName: '', patronymic: '', phone: '', email: '', address: '' });
    setMessage('Клиент создан.');
    await loadClients();
  }

  async function createCalculation() {
    if (!selectedClientId) return setMessage('Сначала выберите клиента.');
    const res = await apiFetch(`/calculations/client/${selectedClientId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ constructionAddress: address }) });
    if (!res.ok) return setMessage('Не удалось создать расчёт.');
    const data = await res.json();
    setCalcId(String(data.id));
    setMessage(`Расчёт #${data.id} создан.`);
  }

  async function postFrame() {
    if (!calcId) return setMessage('Укажите ID расчёта.');
    const floorParams = { floorHeight: Number(frameParams.floorHeight), perimeter: Number(frameParams.perimeter), foundationArea: Number(frameParams.foundationArea), extWallThickness: frameParams.extWallThickness, innerWallLength: Number(frameParams.innerWallLength), intWallThickness: frameParams.intWallThickness, ceilingThickness: frameParams.ceilingThickness, windows: [{ width: 1.4, height: 1.4, count: 8 }], externalDoors: [{ width: 1, height: 2.1, count: 2 }], internalDoors: [{ width: 0.9, height: 2.1, count: 6 }] };
    const payload = { floors: Number(frameParams.floors), floorParamsList: Array.from({ length: Number(frameParams.floors) }, () => floorParams) };
    const res = await apiFetch(`/calculations/${calcId}/frame`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setMessage(res.ok ? 'Каркас рассчитан.' : 'Ошибка расчёта каркаса.');
  }

  async function postFoundation() {
    if (!calcId) return setMessage('Укажите ID расчёта.');
    const res = await apiFetch(`/calculations/${calcId}/foundation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...foundationParams, externalPerimeter: Number(foundationParams.externalPerimeter), innerWallLength: Number(foundationParams.innerWallLength) }) });
    setMessage(res.ok ? 'Фундамент рассчитан.' : 'Ошибка расчёта фундамента.');
  }

  async function loadCabinet() {
    if (!selectedClientId) return setMessage('Выберите клиента.');
    const res = await apiFetch(`/calculations/client/${selectedClientId}`);
    if (!res.ok) return setMessage('Не удалось загрузить историю расчётов.');
    setCabinetCalcs(await res.json());
  }

  async function updateCalcStatus(id, status) {
    const res = await apiFetch(`/calculations/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!res.ok) return setMessage('Не удалось обновить статус.');
    setMessage(`Статус #${id} обновлён.`);
    await loadCabinet();
  }

  async function copyCalculation(id) {
    const res = await apiFetch(`/calculations/${id}/copy`, { method: 'POST' });
    if (!res.ok) return setMessage('Не удалось скопировать расчёт.');
    setMessage(`Расчёт #${id} скопирован.`);
    await loadCabinet();
  }

  async function deleteCalculation(id) {
    const res = await apiFetch(`/calculations/${id}`, { method: 'DELETE' });
    if (!res.ok) return setMessage('Не удалось удалить расчёт.');
    setMessage(`Расчёт #${id} удалён.`);
    await loadCabinet();
  }

  function openTab(nextTab) {
    if (!auth.authenticated && !['home', 'auth'].includes(nextTab)) return setMessage('Для доступа к разделам войдите в систему.');
    setTab(nextTab);
    setMenuOpen(false);
  }

  return (
    <>
      <Header tab={tab} compactHeader={compactHeader} isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen} openTab={openTab} auth={auth} openAuthModal={() => openTab('auth')} />

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
            onLogout={() => { logout(true); openTab('home'); }}
            onClose={() => openTab('home')}
          />
        )}
        {tab === 'home' && <HomeSection heroIndex={heroIndex} openTab={openTab} />}

        {tab === 'materials' && (
          <section className={`content-grid wide ${!auth.authenticated ? 'locked' : ''}`}>
            {!auth.authenticated && <div className="locked-note">Требуется вход в систему.</div>}
            <article className="card"><h3>Каталог материалов</h3><div className="row"><button onClick={loadMaterials}>{loadingMaterials ? 'Загрузка...' : 'Подтянуть из backend'}</button><input value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} placeholder="Поиск" /></div>
              <div className="material-list">{visibleMaterials.map((m) => <div className="material-item" key={m.id}><div><strong>{m.name}</strong><p>{m.unit || ''}</p></div><div className="price-zone"><span>{m.currentPrice} ₽</span><button onClick={() => setCart((prev) => [...prev, m])}>В корзину</button></div></div>)}</div>
            </article>
          </section>
        )}

        {tab === 'calculator' && (
          <section className={`content-grid wide ${!auth.authenticated ? 'locked' : ''}`}>
            {!auth.authenticated && <div className="locked-note">Требуется вход в систему.</div>}
            <article className="card"><h3>Клиент и расчёт</h3><div className="row"><button onClick={loadClients}>Загрузить клиентов</button><select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>{clients.map((c) => <option key={c.id} value={c.id}>{`${c.lastName} ${c.firstName}`}</option>)}</select></div><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес строительства" /><button onClick={createCalculation}>Создать расчёт</button><input value={calcId} onChange={(e) => setCalcId(e.target.value)} placeholder="ID расчёта" /></article>
            <article className="card"><h3>Каркас</h3><div className="row"><label>Этажей</label><input type="number" min="1" max="5" value={frameParams.floors} onChange={(e) => setFrameParams((p) => ({ ...p, floors: e.target.value }))} /></div><div className="row"><label>Высота</label><input type="number" value={frameParams.floorHeight} onChange={(e) => setFrameParams((p) => ({ ...p, floorHeight: e.target.value }))} /></div><div className="row"><label>Периметр</label><input type="number" value={frameParams.perimeter} onChange={(e) => setFrameParams((p) => ({ ...p, perimeter: e.target.value }))} /></div><button onClick={postFrame}>Рассчитать каркас</button></article>
            <article className="card"><h3>Фундамент</h3><div className="row"><label>Периметр</label><input type="number" value={foundationParams.externalPerimeter} onChange={(e) => setFoundationParams((p) => ({ ...p, externalPerimeter: e.target.value }))} /></div><div className="row"><label>Внутр. стены</label><input type="number" value={foundationParams.innerWallLength} onChange={(e) => setFoundationParams((p) => ({ ...p, innerWallLength: e.target.value }))} /></div><button onClick={postFoundation}>Рассчитать фундамент</button></article>
          </section>
        )}

        {tab === 'cabinet' && (
          <section className={`content-grid wide ${!auth.authenticated ? 'locked' : ''}`}>
            {!auth.authenticated && <div className="locked-note">Требуется вход в систему.</div>}
            <article className="card"><h3>Новый клиент</h3><div className="login-form"><input placeholder="Фамилия*" value={createClientForm.lastName} onChange={(e) => setCreateClientForm((p) => ({ ...p, lastName: e.target.value }))} /><input placeholder="Имя*" value={createClientForm.firstName} onChange={(e) => setCreateClientForm((p) => ({ ...p, firstName: e.target.value }))} /><input placeholder="Отчество" value={createClientForm.patronymic} onChange={(e) => setCreateClientForm((p) => ({ ...p, patronymic: e.target.value }))} /><input placeholder="Телефон" value={createClientForm.phone} onChange={(e) => setCreateClientForm((p) => ({ ...p, phone: e.target.value }))} /><input placeholder="Email" value={createClientForm.email} onChange={(e) => setCreateClientForm((p) => ({ ...p, email: e.target.value }))} /><input placeholder="Адрес" value={createClientForm.address} onChange={(e) => setCreateClientForm((p) => ({ ...p, address: e.target.value }))} /><button onClick={createClient}>Создать клиента</button></div></article>
            <article className="card"><h3>История расчётов</h3><div className="row"><button onClick={loadClients}>Клиенты</button><select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>{clients.map((c) => <option key={c.id} value={c.id}>{`${c.lastName} ${c.firstName}`}</option>)}</select><button onClick={loadCabinet}>Обновить</button></div><div className="material-list">{cabinetCalcs.map((calc) => <div key={calc.id} className="material-item stack"><div><strong>#{calc.id}</strong><p>{calc.constructionAddress || ''}</p><p>{calc.status || ''}</p></div><div className="status-actions"><button onClick={() => updateCalcStatus(calc.id, 'ACTUAL')}>ACTUAL</button><button onClick={() => updateCalcStatus(calc.id, 'NOT_ACTUAL')}>NOT_ACTUAL</button><button onClick={() => updateCalcStatus(calc.id, 'CONTRACT_SIGNED')}>CONTRACT_SIGNED</button><button onClick={() => copyCalculation(calc.id)}>Копия</button><button className="danger" onClick={() => deleteCalculation(calc.id)}>Удалить</button></div></div>)}</div></article>
          </section>
        )}

        <p className="result-msg">{message}</p>
      </main>
    </>
  );
}

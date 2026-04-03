import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import SiteFooter from './components/SiteFooter';
import CalculatorSection from './sections/CalculatorSection';
import CabinetSection from './sections/CabinetSection';
import HomeSection, { HERO_IMAGES } from './sections/HomeSection';
import MaterialsSection from './sections/MaterialsSection';
import { API_BASE, authHeaders, refreshSession, safeStorage } from './services/api';

function sortCalculations(calculations = []) {
  return [...calculations].sort(
    (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  );
}

const EMPTY_CLIENT_FORM = {
  lastName: '',
  firstName: '',
  patronymic: '',
  phone: '',
  email: '',
  address: ''
};

const WALL_INSULATION_BY_THICKNESS = {
  MM_100: 'Эковер 100 мм',
  MM_150: 'Эковер 150 мм',
  MM_200: 'Эковер 200 мм',
  MM_250: 'Эковер 250 мм'
};

const CEILING_INSULATION_BY_THICKNESS = {
  MM_200: 'Эковер 200 мм',
  MM_250: 'Эковер 250 мм'
};

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
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT_FORM);
  const [creatingClient, setCreatingClient] = useState(false);
  const [materialFilter, setMaterialFilter] = useState('');
  const [materials, setMaterials] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [address, setAddress] = useState('г. Москва, ул. Строителей, 9');
  const [cart, setCart] = useState(JSON.parse(safeStorage.get('cart', '[]') || '[]'));
  const [calcId, setCalcId] = useState('');
  const [cabinetCalcs, setCabinetCalcs] = useState([]);
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

  const selectedClient = useMemo(
    () => clients.find((client) => String(client.id) === String(selectedClientId)),
    [clients, selectedClientId]
  );

  const recentCalculations = useMemo(() => {
    if (cabinetCalcs.length) {
      return sortCalculations(cabinetCalcs);
    }

    return sortCalculations(selectedClient?.calculations || []);
  }, [cabinetCalcs, selectedClient]);

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

      if (!scrollingDown) {
        setMenuOpen(false);
      }

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

  useEffect(() => {
    if (auth.authenticated && !clients.length) {
      loadClients();
    }
  }, [auth.authenticated, clients.length]);

  useEffect(() => {
    setCabinetCalcs([]);
  }, [selectedClientId]);

  useEffect(() => {
    if (!selectedClient) {
      setCalcId('');
      return;
    }

    const clientCalculations = sortCalculations(selectedClient.calculations || []);
    if (!clientCalculations.length) {
      if (!cabinetCalcs.length) {
        setCalcId('');
      }
      return;
    }

    const hasCurrent = clientCalculations.some((calculation) => String(calculation.id) === String(calcId));
    if (!hasCurrent) {
      setCalcId(String(clientCalculations[0].id));
    }
  }, [selectedClient, cabinetCalcs.length, calcId]);

  useEffect(() => {
    if (['calculator', 'cabinet'].includes(tab) && auth.authenticated && selectedClientId) {
      loadCabinet();
    }
  }, [tab, auth.authenticated, selectedClientId]);

  async function apiFetch(path, options = {}, retry = true) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...(options.headers || {}), ...authHeaders() }
    });

    if (response.status === 401 && retry) {
      const refreshed = await refreshSession(setAuth);
      if (refreshed) {
        return apiFetch(path, options, false);
      }

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
    setSelectedClientId('');
    setCalcId('');
    setCabinetCalcs([]);

    if (withMsg) {
      setMessage('Сессия завершена.');
    }
  }

  async function loadClients(options = {}) {
    const response = await apiFetch('/clients');
    if (!response.ok) {
      setMessage('Не удалось загрузить клиентов.');
      return [];
    }

    const data = await response.json();
    setClients(data);

    if (!data.length) {
      setSelectedClientId('');
      setCalcId('');
      return data;
    }

    const preferredClientId = options.preferredClientId || selectedClientId;
    const nextClient = data.find((client) => String(client.id) === String(preferredClientId)) || data[0];
    const nextClientId = String(nextClient.id);
    setSelectedClientId(nextClientId);

    const nextCalculations = sortCalculations(nextClient.calculations || []);
    const preferredCalcId = options.preferredCalcId || calcId;
    const nextCalc =
      nextCalculations.find((calculation) => String(calculation.id) === String(preferredCalcId)) || nextCalculations[0];

    setCalcId(nextCalc ? String(nextCalc.id) : '');
    return data;
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

  async function handleRefreshSession() {
    const refreshed = await refreshSession(setAuth);
    if (!refreshed) {
      setMessage('Не удалось обновить сессию.');
      return;
    }

    setMessage('Сессия обновлена.');
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

      if (!response.ok) {
        throw new Error();
      }

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
      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setMaterials(data);
      setMessage('');
    } catch {
      setMessage('Не удалось загрузить материалы.');
    } finally {
      setLoadingMaterials(false);
    }
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
    setMessage('Расчёт создан.');
    await loadClients({ preferredClientId: selectedClientId, preferredCalcId: data.id });
  }

  async function createClient() {
    const payload = {
      lastName: clientForm.lastName.trim(),
      firstName: clientForm.firstName.trim(),
      patronymic: clientForm.patronymic.trim(),
      phone: clientForm.phone.trim(),
      email: clientForm.email.trim(),
      address: clientForm.address.trim()
    };

    if (!payload.lastName || !payload.firstName) {
      setMessage('Укажите имя и фамилию клиента.');
      return;
    }

    setCreatingClient(true);

    try {
      const response = await apiFetch('/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          patronymic: payload.patronymic || null,
          phone: payload.phone || null,
          email: payload.email || null,
          address: payload.address || null
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Не удалось создать клиента.');
      }

      const createdClient = await response.json();
      setClientForm(EMPTY_CLIENT_FORM);
      await loadClients({ preferredClientId: createdClient.id });
      setMessage(`Клиент ${createdClient.lastName} ${createdClient.firstName} добавлен.`);
    } catch (error) {
      setMessage(error.message || 'Не удалось создать клиента.');
    } finally {
      setCreatingClient(false);
    }
  }

  async function postFrame() {
    if (!calcId) {
      setMessage('Сначала выберите расчёт.');
      return;
    }

    const floorParams = {
      floorHeight: Number(frameParams.floorHeight),
      perimeter: Number(frameParams.perimeter),
      foundationArea: Number(frameParams.foundationArea),
      extWallThickness: frameParams.extWallThickness,
      innerWallLength: Number(frameParams.innerWallLength),
      intWallThickness: frameParams.intWallThickness,
      extOsb: 'OSB 9 мм',
      extVapor: 'Ондутис',
      extWindBarrier: 'Паро-проницаемая ветро-влагозащита A Optima',
      extInsulation: WALL_INSULATION_BY_THICKNESS[frameParams.extWallThickness] || 'Эковер 150 мм',
      intOsb: 'OSB 9 мм',
      ceilingThickness: frameParams.ceilingThickness,
      ceilingOsb: 'OSB 9 мм',
      ceilingVapor: 'Ондутис',
      ceilingWindBarrier: 'Гидро-ветрозащита Тип А',
      ceilingInsulation: CEILING_INSULATION_BY_THICKNESS[frameParams.ceilingThickness] || 'Эковер 200 мм',
      windows: [{ width: 1.4, height: 1.4, quantity: 8 }],
      externalDoors: [{ width: 1, height: 2.1, quantity: 2 }],
      internalDoors: [{ width: 0.9, height: 2.1, quantity: 6 }]
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

    if (!response.ok) {
      setMessage('Ошибка расчёта каркаса.');
      return;
    }

    await loadCabinet();
    setMessage('Каркас рассчитан.');
  }

  async function postFoundation() {
    if (!calcId) {
      setMessage('Сначала выберите расчёт.');
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

    if (!response.ok) {
      setMessage('Ошибка расчёта фундамента.');
      return;
    }

    await loadCabinet();
    setMessage('Фундамент рассчитан.');
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

    const data = sortCalculations(await response.json());
    setCabinetCalcs(data);

    if (!calcId && data[0]) {
      setCalcId(String(data[0].id));
    }
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

    setMessage('Статус расчёта обновлён.');
    await loadClients({ preferredClientId: selectedClientId, preferredCalcId: calcId });
    await loadCabinet();
  }

  async function copyCalculation(id) {
    const response = await apiFetch(`/calculations/${id}/copy`, { method: 'POST' });
    if (!response.ok) {
      setMessage('Не удалось скопировать расчёт.');
      return;
    }

    setMessage('Копия расчёта создана.');
    await loadClients({ preferredClientId: selectedClientId });
    await loadCabinet();
  }

  async function deleteCalculation(id) {
    const response = await apiFetch(`/calculations/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setMessage('Не удалось удалить расчёт.');
      return;
    }

    if (String(calcId) === String(id)) {
      setCalcId('');
    }

    setMessage('Расчёт удалён.');
    await loadClients({ preferredClientId: selectedClientId });
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

    if (['calculator', 'cabinet'].includes(nextTab) && auth.authenticated && !clients.length) {
      loadClients();
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
            onRefresh={handleRefreshSession}
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
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
          />
        )}

        {tab === 'calculator' && auth.authenticated && (
          <CalculatorSection
            clients={clients}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            loadClients={loadClients}
            address={address}
            setAddress={setAddress}
            createCalculation={createCalculation}
            clientForm={clientForm}
            setClientForm={setClientForm}
            createClient={createClient}
            creatingClient={creatingClient}
            calcId={calcId}
            setCalcId={setCalcId}
            frameParams={frameParams}
            setFrameParams={setFrameParams}
            foundationParams={foundationParams}
            setFoundationParams={setFoundationParams}
            postFrame={postFrame}
            postFoundation={postFoundation}
            openTab={openTab}
            recentCalculations={recentCalculations}
          />
        )}

        {tab === 'cabinet' && auth.authenticated && (
          <CabinetSection
            clients={clients}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            loadClients={loadClients}
            loadCabinet={loadCabinet}
            cabinetCalcs={cabinetCalcs}
            updateCalcStatus={updateCalcStatus}
            copyCalculation={copyCalculation}
            deleteCalculation={deleteCalculation}
          />
        )}

        {message ? <p className="result-msg">{message}</p> : null}
      </main>

      <SiteFooter
        authenticated={auth.authenticated}
        tab={tab}
        openTab={openTab}
        loadMaterials={loadMaterials}
        loadingMaterials={loadingMaterials}
        materialsCount={materials.length}
        cartCount={cart.length}
      />
    </>
  );
}

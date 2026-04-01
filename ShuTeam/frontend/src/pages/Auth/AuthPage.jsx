import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Check, AlertCircle } from 'lucide-react';
import * as api from '../../api';
import './AuthPage.css';

const CATEGORIES = ['Художники', 'Чтение', 'Музыка', 'Аниме', 'Кулинария', 'Философия', 'Спорт', 'Кино', 'Вязание', 'Языки'];

const AuthPage = ({ onAuth }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', phone: '', password: '', confirm: '', city: '',
    categories: [],
  });

  const toggleCategory = (cat) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError(''); };

  /* ── LOGIN ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login({ phone: form.phone, password: form.password });
      onAuth();
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER step 1 → step 2 ── */
  const handleRegisterStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (form.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    setStep(2);
  };

  /* ── REGISTER step 2 → submit ── */
  const handleRegisterStep2 = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register({
        phone: form.phone,
        name: form.name,
        password: form.password,
        city: form.city || undefined,
      });
      onAuth();
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── ФОН + ЛОГО ── */}
      <div className="auth-bg">
        <div className="auth-logo">
          <div className="auth-logo-mark">S</div>
          <span className="auth-logo-text">ShuTeam</span>
        </div>
        <div className="auth-tagline">Офлайн-сообщества рядом с тобой</div>
      </div>

      {/* ── КАРТОЧКА ФОРМЫ ── */}
      <div className="auth-card">
        <div className="auth-card-handle"/>

        {/* Блок ошибки */}
        {error && (
          <div className="auth-error">
            <AlertCircle size={15}/> {error}
          </div>
        )}

        {/* ВХОД */}
        {mode === 'login' && (
          <>
            <h2 className="auth-title">Добро пожаловать!</h2>
            <p className="auth-sub">Войдите в свой аккаунт</p>
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label>Телефон</label>
                <input required type="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={set('phone')}/>
              </div>
              <div className="auth-field">
                <label>Пароль</label>
                <div className="pass-wrap">
                  <input required type={showPassword ? 'text' : 'password'} placeholder="Введите пароль" value={form.password} onChange={set('password')}/>
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <button type="button" className="forgot-link" onClick={() => setMode('forgot')}>Забыли пароль?</button>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Вход...' : <> Войти <ArrowRight size={18}/></>}
              </button>
            </form>
            <div className="auth-divider"><span>или</span></div>
            <div className="auth-switch">Нет аккаунта? <button onClick={() => { setMode('register'); setStep(1); setError(''); }}>Зарегистрироваться</button></div>
          </>
        )}

        {/* РЕГИСТРАЦИЯ — шаг 1 */}
        {mode === 'register' && step === 1 && (
          <>
            <div className="auth-step-row">
              <div className="auth-step active">1</div>
              <div className="auth-step-line"/>
              <div className="auth-step">2</div>
            </div>
            <h2 className="auth-title">Создать аккаунт</h2>
            <p className="auth-sub">Шаг 1 из 2 — Личные данные</p>
            <form className="auth-form" onSubmit={handleRegisterStep1}>
              <div className="auth-field">
                <label>Имя</label>
                <input required placeholder="Ваше имя" value={form.name} onChange={set('name')}/>
              </div>
              <div className="auth-field">
                <label>Телефон</label>
                <input required type="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={set('phone')}/>
              </div>
              <div className="auth-field">
                <label>Город</label>
                <input placeholder="Алматы" value={form.city} onChange={set('city')}/>
              </div>
              <div className="auth-field">
                <label>Пароль</label>
                <div className="pass-wrap">
                  <input required type={showPassword ? 'text' : 'password'} placeholder="Минимум 6 символов" value={form.password} onChange={set('password')}/>
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label>Подтвердите пароль</label>
                <div className="pass-wrap">
                  <input required type={showConfirm ? 'text' : 'password'} placeholder="Повторите пароль" value={form.confirm} onChange={set('confirm')}/>
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-submit-btn">Далее <ArrowRight size={18}/></button>
            </form>
            <div className="auth-switch">Уже есть аккаунт? <button onClick={() => setMode('login')}>Войти</button></div>
          </>
        )}

        {/* РЕГИСТРАЦИЯ — шаг 2: интересы */}
        {mode === 'register' && step === 2 && (
          <>
            <div className="auth-step-row">
              <div className="auth-step done"><Check size={14}/></div>
              <div className="auth-step-line active"/>
              <div className="auth-step active">2</div>
            </div>
            <h2 className="auth-title">Ваши интересы</h2>
            <p className="auth-sub">Шаг 2 из 2 — Выберите категории</p>
            <form className="auth-form" onSubmit={handleRegisterStep2}>
              <div className="auth-categories">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`auth-cat-chip ${form.categories.includes(cat) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {form.categories.includes(cat) && <Check size={13}/>}
                    {cat}
                  </button>
                ))}
              </div>
              <p className="auth-cat-hint">Выбрано: {form.categories.length} категорий</p>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Регистрация...' : <> Начать <ArrowRight size={18}/></>}
              </button>
              <button type="button" className="auth-skip-btn" onClick={handleRegisterStep2} disabled={loading}>
                Пропустить
              </button>
            </form>
          </>
        )}

        {/* ВОССТАНОВЛЕНИЕ ПАРОЛЯ */}
        {mode === 'forgot' && (
          <>
            <h2 className="auth-title">Восстановление</h2>
            <p className="auth-sub">Свяжитесь с поддержкой по номеру телефона</p>
            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); setMode('login'); }}>
              <div className="auth-field">
                <label>Телефон</label>
                <input required type="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={set('phone')}/>
              </div>
              <button type="submit" className="auth-submit-btn">Отправить запрос <ArrowRight size={18}/></button>
              <button type="button" className="auth-skip-btn" onClick={() => setMode('login')}>← Вернуться ко входу</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
import { Plus, Users, BarChart3, Wallet, Trophy, MapPin, ChevronDown, Trash2, Check, X } from 'lucide-react';
import './LeaderPanel.css';



const LeaderPanel = () => {
  const [activeTab, setActiveTab] = useState('meetings');
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', cost: '', spots: '', age: 'all', materials: '', location: '', venueId: '' });
  const [goalForm, setGoalForm] = useState({ title: '', type: 'week', reward: '' });
  const [venueModal, setVenueModal] = useState(false);

  const balance = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const GROWTH = [0, 0, 0, 0, 0, events.length]; // Very basic mock growth based on real events
  const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
  const maxGrowth = Math.max(...GROWTH, 1);

  React.useEffect(() => {
    // Fetch user's first community to manage
    api.getUserCommunities().then(async comms => {
      if (comms && comms.length > 0) {
        const cid = comms[0].id;
        const [mArr, eArr, gArr, tArr, vArr] = await Promise.all([
          api.getCommunityMembers(cid),
          api.getMeetings({ community_id: cid }),
          api.getCommunityGoals(cid),
          api.getTransactions(), // These are global for user, but fine for now
          api.getVenues()
        ]);
        setMembers(mArr || []);
        setEvents((eArr || []).map(m => ({
          id: m.id,
          title: m.title,
          date: new Date(m.date_time).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
          time: new Date(m.date_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          cost: m.cost || 0,
          spots: m.spots || 0,
          filled: m.filled || 0,
          location: m.location_address || ''
        })));
        setGoals(gArr || []);
        setTransactions(tArr || []);
        setVenues(vArr || []);
      }
    });
  }, []);

  const createEvent = (e) => {
    e.preventDefault();
    setEvents([...events, { ...eventForm, id: Date.now(), filled: 0, spots: parseInt(eventForm.spots) || 20 }]);
    setShowEventForm(false);
    setEventForm({ title: '', date: '', time: '', cost: '', spots: '', age: 'all', materials: '', location: '', venueId: '' });
  };

  const createGoal = (e) => {
    e.preventDefault();
    setGoals([...goals, { ...goalForm, id: Date.now() }]);
    setShowGoalForm(false);
    setGoalForm({ title: '', type: 'week', reward: '' });
  };

  const changeRole = (id, role) => setMembers(members.map(m => m.id === id ? { ...m, role } : m));
  const removeMember = (id) => setMembers(members.filter(m => m.id !== id));

  const ROLES = { participant: 'Участник', moderator: 'Модератор', helper: 'Помощник' };

  return (
    <div className="leader-panel">
      <header className="leader-header">
        <h1>Клуб Художников</h1>
        <p>Панель управления лидера</p>
      </header>

      <div className="leader-content">
        <div className="leader-tabs">
          {[
            { key: 'meetings', label: 'Встречи' },
            { key: 'members', label: 'Участники' },
            { key: 'analytics', label: 'Аналитика' },
            { key: 'gamification', label: 'Игры' },
            { key: 'finance', label: 'Финансы' },
          ].map(t => (
            <button key={t.key} className={activeTab === t.key ? 'active' : ''} onClick={() => setActiveTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* === ВСТРЕЧИ === */}
        {activeTab === 'meetings' && (
          <div className="panel-content">
            <button className="create-btn" onClick={() => setShowEventForm(!showEventForm)}>
              <Plus size={18} /> Создать встречу
            </button>

            {showEventForm && (
              <form className="leader-form" onSubmit={createEvent}>
                <h4>Новое мероприятие</h4>
                <div className="form-grid-2">
                  <div className="lf-group"><label>Название</label><input required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Пленэр в парке" /></div>
                  <div className="lf-group"><label>Дата</label><input required type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} /></div>
                  <div className="lf-group"><label>Время</label><input required type="time" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} /></div>
                  <div className="lf-group"><label>Стоимость (₸)</label><input type="number" value={eventForm.cost} onChange={e => setEventForm({ ...eventForm, cost: e.target.value })} placeholder="0 — бесплатно" /></div>
                  <div className="lf-group"><label>Мест</label><input type="number" value={eventForm.spots} onChange={e => setEventForm({ ...eventForm, spots: e.target.value })} placeholder="20" /></div>
                  <div className="lf-group">
                    <label>Возраст</label>
                    <select value={eventForm.age} onChange={e => setEventForm({ ...eventForm, age: e.target.value })}>
                      <option value="all">Все возрасты</option>
                      <option value="junior">Junior (до 18)</option>
                      <option value="senior">Senior (18+)</option>
                    </select>
                  </div>
                </div>
                <div className="lf-group"><label>Материалы (через запятую)</label><input value={eventForm.materials} onChange={e => setEventForm({ ...eventForm, materials: e.target.value })} placeholder="Акварель, кисти, альбом" /></div>
                <div className="lf-group">
                  <label>Локация</label>
                  <div className="venue-selector">
                    <input value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Введите адрес или выберите из каталога" />
                    <button type="button" className="venue-catalog-btn" onClick={() => setVenueModal(true)}><MapPin size={14} /> Выбрать</button>
                  </div>
                </div>
                <div className="form-footer-btns">
                  <button type="button" className="btn-secondary-small" onClick={() => setShowEventForm(false)}>Отмена</button>
                  <button type="submit" className="btn-primary-small">Создать</button>
                </div>
              </form>
            )}

            <div className="events-created">
              {events.map(ev => (
                <div key={ev.id} className="mini-event">
                  <div className="mini-info">
                    <h4>{ev.title}</h4>
                    <p>{ev.date} {ev.time} · {ev.location}</p>
                  </div>
                  <div className="mini-stats">
                    <span><Users size={12} /> {ev.filled}/{ev.spots}</span>
                    <span>{ev.cost > 0 ? `${ev.cost} ₸` : 'Бесплатно'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === УЧАСТНИКИ === */}
        {activeTab === 'members' && (
          <div className="panel-content">
            <div className="members-filters">
              <span className="member-count">Всего: {members.length}</span>
              <span className="member-active">{members.filter(m => m.active).length} активных</span>
            </div>
            <div className="members-list">
              {members.map(m => (
                <div key={m.id} className={`member-card ${!m.active ? 'inactive' : ''}`}>
                  <div className="member-avatar">{m.name[0]}</div>
                  <div className="member-info">
                    <div className="member-name">{m.name}</div>
                    <div className="member-stats">{m.visits} встреч · {m.active ? 'Активен' : 'Неактивен'}</div>
                  </div>
                  <div className="member-actions">
                    <select value={m.role} onChange={e => changeRole(m.id, e.target.value)}>
                      {Object.entries(ROLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="del-btn" onClick={() => removeMember(m.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === АНАЛИТИКА === */}
        {activeTab === 'analytics' && (
          <div className="panel-content">
            <div className="analytics-card">
              <h4>Рост сообщества по месяцам</h4>
              <div className="analytics-chart">
                {GROWTH.map((v, i) => (
                  <div key={i} className="analytics-col">
                    <div className="a-bar-wrap">
                      <div className="a-bar" style={{ height: `${(v / maxGrowth) * 100}%` }}></div>
                    </div>
                    <div className="a-label">{MONTHS[i]}</div>
                    <div className="a-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="analytics-card">
              <h4>Активность участников</h4>
              <div className="activity-summary">
                <div className="activity-item green">
                  <div className="act-val">{members.filter(m => m.active).length}</div>
                  <div className="act-label">Активные</div>
                </div>
                <div className="activity-item red">
                  <div className="act-val">{members.filter(m => !m.active).length}</div>
                  <div className="act-label">Давно не заходили</div>
                </div>
                <div className="activity-item blue">
                  <div className="act-val">{events.length}</div>
                  <div className="act-label">Встреч проведено</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === ГЕЙМИФИКАЦИЯ === */}
        {activeTab === 'gamification' && (
          <div className="panel-content">
            <button className="create-btn" onClick={() => setShowGoalForm(!showGoalForm)}>
              <Plus size={18} /> Создать цель / бейдж
            </button>

            {showGoalForm && (
              <form className="leader-form" onSubmit={createGoal}>
                <h4>Новая цель</h4>
                <div className="lf-group"><label>Описание задания</label><input required value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="Нарисовать 5 картин" /></div>
                <div className="lf-group">
                  <label>Тип</label>
                  <select value={goalForm.type} onChange={e => setGoalForm({ ...goalForm, type: e.target.value })}>
                    <option value="week">Цель недели</option>
                    <option value="month">Челлендж месяца</option>
                    <option value="streak">Выдержка (стрик)</option>
                  </select>
                </div>
                <div className="lf-group"><label>Награда</label><input value={goalForm.reward} onChange={e => setGoalForm({ ...goalForm, reward: e.target.value })} placeholder="Бейдж «Мастер», скидка 50%" /></div>
                <div className="form-footer-btns">
                  <button type="button" className="btn-secondary-small" onClick={() => setShowGoalForm(false)}>Отмена</button>
                  <button type="submit" className="btn-primary-small">Добавить</button>
                </div>
              </form>
            )}

            <div className="goals-list">
              {goals.map(g => (
                <div key={g.id} className="goal-leader-card">
                  <div className="glc-title">{g.title}</div>
                  <div className="glc-meta">
                    <span className="glc-type">{g.type === 'week' ? 'Неделя' : g.type === 'month' ? 'Месяц' : 'Стрик'}</span>
                    {g.reward && <span className="glc-reward">{g.reward}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === ФИНАНСЫ === */}
        {activeTab === 'finance' && (
          <div className="panel-content">
            <div className="balance-card">
              <div className="balance-label">Баланс организатора</div>
              <div className="balance-amount">{balance.toLocaleString()} ₸</div>
              <div className="balance-note">* После вычета 10% комиссии платформы</div>
              <button className="withdraw-btn">Вывести средства</button>
            </div>
            <h4 className="transactions-title">История транзакций</h4>
            <div className="transactions-list">
              {transactions.length === 0 ? <p style={{ color: '#888', fontSize: 13 }}>История транзакций пуста</p> : null}
              {transactions.map(t => (
                <div key={t.id} className="transaction-item">
                  <div className="tr-info">
                    <div className="tr-desc">{t.title || 'Пополнение/Списание'}</div>
                    <div className="tr-date">{new Date(t.created_at).toLocaleDateString('ru-RU')}</div>
                  </div>
                  <div className="tr-amounts">
                    <div className="tr-net">{t.amount} ₸</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно выбора площадки */}
      {venueModal && (
        <div className="modal-overlay-dark" onClick={() => setVenueModal(false)}>
          <div className="venue-modal" onClick={e => e.stopPropagation()}>
            <h3>Выбор площадки</h3>
            {venues.map(v => (
              <div key={v.id} className="venue-item" onClick={() => { setEventForm({ ...eventForm, location: v.name, venueId: v.id }); setVenueModal(false); }}>
                <div className="vi-name">{v.name}</div>
                <div className="vi-addr">{v.address} · {v.capacity} чел.</div>
              </div>
            ))}
            <button className="close-venue-btn" onClick={() => setVenueModal(false)}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderPanel;

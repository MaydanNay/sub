import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ParentLayout from '../layouts/ParentLayout';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { 
  Zap, 
  Award, 
  Clock, 
  BookOpen,
  Calendar,
  Activity,
  Coins,
  ChevronRight,
  TrendingUp,
  Shield,
  Search,
  UserPlus,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';

const ParentDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState(null);
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchData = async (childId = null) => {
    try {
      setLoading(true);
      const url = childId ? `/parent/dashboard?child_id=${childId}` : '/parent/dashboard';
      const res = await api.get(url);
      setData(res.data);
      if (res.data.selected_child) {
        setSelectedChildId(res.data.selected_child.id);
      }
    } catch (err) {
      console.error("Error fetching parent dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChildChange = (id) => {
    fetchData(id);
  };

  const handleSearch = async (val) => {
      setSearchQuery(val);
      if (val.length < 3) {
          setSearchResults([]);
          return;
      }
      setSearching(true);
      try {
          const res = await api.get(`/parent/search-students?q=${val}`);
          setSearchResults(res.data);
      } catch (err) {
          console.error(err);
      } finally {
          setSearching(false);
      }
  };

  const handleRequestLink = async (studentId) => {
      try {
          await api.post(`/parent/request-link?student_id=${studentId}`);
          alert(t('request_sent') || 'Запрос отправлен ребенку на подтверждение');
          setShowSearch(false);
          setSearchQuery('');
          setSearchResults([]);
      } catch (err) {
          alert(t('error'));
      }
  };

  if (loading && !data) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{t('loading')}</div>;

  const child = data?.selected_child;
  const dashboard = data?.child_dashboard;

  const statsMap = [
    { subject: t('economy'), value: dashboard?.character?.economy || 0 },
    { subject: t('wisdom'), value: dashboard?.character?.wisdom || 0 },
    { subject: t('influence'), value: dashboard?.character?.influence || 0 },
    { subject: t('health'), value: dashboard?.character?.health || 0 },
    { subject: t('strength'), value: dashboard?.character?.strength || 0 },
    { subject: t('diplomacy'), value: dashboard?.character?.diplomacy || 0 },
    { subject: t('technology'), value: dashboard?.character?.technology || 0 },
    { subject: t('intellect'), value: dashboard?.character?.intellect || 0 },
  ];

  return (
    <div className="parent-dashboard-page animate-fade-in">
        
        {/* Horizontal Child Switcher */}
        <div className="child-switcher-mobile">
            {data?.children?.map(c => (
                <div 
                    key={c.id} 
                    className={`child-pill ${selectedChildId === c.id ? 'active' : ''}`}
                    onClick={() => handleChildChange(c.id)}
                >
                    <Avatar user={{ ...c, profile_image: c.avatar }} size={32} />
                    <span>{c.full_name.split(' ')[0]}</span>
                </div>
            ))}
            <div className="child-pill add-btn" onClick={() => setShowSearch(true)}>
                <UserPlus size={18} />
                <span>{t('add')}</span>
            </div>
        </div>

        {showSearch && (
            <div className="search-overlay" onClick={() => setShowSearch(false)}>
                <div className="search-modal card glass-effect" onClick={e => e.stopPropagation()}>
                    <div className="search-header">
                        <h3>{t('find_child') || 'Найти ребенка'}</h3>
                        <X size={20} onClick={() => setShowSearch(false)} style={{ cursor: 'pointer' }} />
                    </div>
                    <div className="search-input-wrap">
                        <Search size={18} className="search-icon" />
                        <input 
                            autoFocus
                            placeholder={t('search_by_username') || 'Поиск по @username или ФИО'} 
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="search-results">
                        {searching && <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>{t('searching') || 'Поиск...'}</p>}
                        {searchResults.map(res => (
                            <div key={res.id} className="search-item" onClick={() => handleRequestLink(res.id)}>
                                <Avatar user={res} size={36} />
                                <div className="res-info">
                                    <p className="res-name">{res.full_name}</p>
                                    <p className="res-user">@{res.username}</p>
                                </div>
                                <UserPlus size={16} className="add-icn" />
                            </div>
                        ))}
                        {!searching && searchQuery.length >= 3 && searchResults.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>{t('no_results') || 'Ничего не найдено'}</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        {child ? (
            <>
                {/* Info Card */}
                <div className="child-brief-card">
                    <div className="brief-main">
                        <div className="brief-text">
                            <h3 className="brief-name">{child?.full_name}</h3>
                            <p className="brief-class">{child?.class_name}</p>
                        </div>
                        <div className="brief-stats">
                            <div className="b-stat">
                                <Zap size={14} color="var(--parent-accent)" />
                                <span>{dashboard?.character?.level || 1} lvl</span>
                            </div>
                            <div className="b-stat">
                                <Coins size={14} color="#ffd700" />
                                <span>{dashboard?.character?.coins || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mobile-stack">
                    {/* Radar Stats Section */}
                    <div className="premium-card radar-section">
                        <div className="card-header-mini">
                            <TrendingUp size={18} color="var(--parent-accent)" />
                            <h3>{t('characteristics')}</h3>
                        </div>
                        <div className="radar-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsMap}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                    <Radar
                                        name="Stats"
                                        dataKey="value"
                                        stroke="var(--parent-accent)"
                                        fill="var(--parent-accent)"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Attendance & Streaks */}
                    <div className="premium-card streaks-section">
                        <div className="card-header-mini">
                            <Award size={18} color="#ff9f43" />
                            <h3>{t('streaks_title')}</h3>
                        </div>
                        <div className="streaks-row">
                            {dashboard?.streaks?.map(streak => (
                                <div key={streak.id} className="streak-bubble">
                                    <div className="streak-emoji">🔥</div>
                                    <div className="streak-details">
                                        <span className="s-label">{getStreakLabel(streak.type, t)}</span>
                                        <span className="s-val">{streak.current_count} {t('days')}</span>
                                    </div>
                                </div>
                            ))}
                            {(!dashboard?.streaks || dashboard.streaks.length === 0) && (
                                <p className="empty-state-text">{t('no_streaks_msg')}</p>
                            )}
                        </div>
                    </div>

                    <div className="premium-card attendance-section">
                        <div className="card-header-mini">
                            <Calendar size={18} color="#28c76f" />
                            <h3>{t('attendance_title')}</h3>
                        </div>
                        <div className="attendance-timeline">
                            {dashboard?.recent_attendance?.slice(0, 5).map((record) => (
                                <div key={record.id} className="attendance-entry">
                                    <div className={`timeline-dot ${record.status}`} />
                                    <div className="entry-main">
                                        <span className="entry-type">{record.type === 'school_entry' ? t('school_entry_label') : t('lesson_label')}</span>
                                        <span className="entry-time">{new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className={`entry-status-badge ${record.status}`}>
                                        {record.status === 'on_time' ? t('on_time_label') : 
                                        record.status === 'late' ? t('late_label') : t('absent_label')}
                                    </div>
                                </div>
                            ))}
                            {(!dashboard?.recent_attendance || dashboard.recent_attendance.length === 0) && (
                                <p className="empty-state-text">{t('no_attendance_msg')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="empty-dashboard-state card glass-effect animate-fade-in" style={{ padding: '60px 20px', textAlign: 'center', marginTop: '40px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Users size={40} color="var(--parent-accent)" />
                </div>
                <h3>{t('no_children_linked') || 'Нет привязанных детей'}</h3>
                <p style={{ color: '#888', fontSize: '14px', margin: '10px 0 25px' }}>{t('link_child_prompt') || 'Найдите своего ребенка по логину, чтобы следить за успехами'}</p>
                <button className="premium-btn active" onClick={() => setShowSearch(true)} style={{ background: 'var(--parent-accent)', color: 'white', padding: '15px 30px', borderRadius: '15px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                    {t('find_child') || 'Найти ребенка'}
                </button>
            </div>
        )}

      <style dangerouslySetInnerHTML={{ __html: `
        .parent-dashboard-page {
            padding: 15px;
            padding-bottom: 50px;
        }

        /* Child Switcher */
        .child-switcher-mobile {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 5px 5px 15px 5px;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .child-switcher-mobile::-webkit-scrollbar { display: none; }

        .child-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.05);
            padding: 6px 14px 6px 6px;
            border-radius: 30px;
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.6);
            white-space: nowrap;
            transition: all 0.3s;
            cursor: pointer;
        }

        .child-pill.active {
            background: var(--parent-accent);
            border-color: var(--parent-accent);
            color: white;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        
        .child-pill.add-btn { background: rgba(255,255,255,0.1); color: white; border-style: dashed; }

        /* Search Modal */
        .search-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
            z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding-top: 80px;
        }
        .search-modal {
            width: 100%; max-width: 400px; background: #111; border-radius: 30px; padding: 25px;
            animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .search-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: white; }
        .search-header h3 { margin: 0; font-size: 18px; font-weight: 800; }
        
        .search-input-wrap {
            background: rgba(255,255,255,0.05); border-radius: 15px; padding: 12px 15px;
            display: flex; align-items: center; gap: 10px; border: 1px solid rgba(255,255,255,0.1);
        }
        .search-input-wrap input { background: transparent; border: none; color: white; flex: 1; outline: none; font-size: 15px; }
        .search-icon { color: #666; }
        
        .search-results { margin-top: 20px; max-height: 300px; overflow-y: auto; }
        .search-item {
            display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 15px;
            transition: 0.2s; cursor: pointer;
        }
        .search-item:hover { background: rgba(255,255,255,0.05); }
        .res-info { flex: 1; }
        .res-name { color: white; font-weight: 700; margin: 0; font-size: 14px; }
        .res-user { color: #666; font-size: 12px; margin: 0; }
        .add-icn { color: var(--parent-accent); }

        /* Brief Card */
        .child-brief-card {
            background: var(--bg-card);
            border-radius: 28px;
            padding: 20px;
            margin-bottom: 20px;
            color: var(--text-dark);
        }
        .brief-main { display: flex; justify-content: space-between; align-items: center; }
        .brief-name { font-weight: 800; font-size: 20px; margin: 0; }
        .brief-class { font-weight: 600; color: #666; margin: 0; font-size: 14px; }
        .brief-stats { display: flex; gap: 10px; }
        .b-stat { background: rgba(0,0,0,0.05); padding: 4px 10px; border-radius: 12px; display: flex; align-items: center; gap: 5px; font-weight: 700; font-size: 12px; }

        .mobile-stack { display: flex; flex-direction: column; gap: 15px; }
        .premium-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; padding: 20px; }
        .card-header-mini { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
        .card-header-mini h3 { margin: 0; font-size: 14px; font-weight: 800; color: white; text-transform: uppercase; }
        .radar-section { height: 350px; }
        .radar-container { width: 100%; height: 100%; }
        .streaks-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .streak-bubble { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 18px; display: flex; align-items: center; gap: 8px; flex: 1; min-width: 120px; }
        .s-label { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 700; display: block; }
        .s-val { font-size: 12px; font-weight: 800; color: white; }
        .attendance-timeline { display: flex; flex-direction: column; gap: 10px; }
        .attendance-entry { display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 16px; }
        .timeline-dot { width: 8px; height: 8px; border-radius: 50%; }
        .timeline-dot.on_time { background: #28c76f; }
        .timeline-dot.late { background: #ff9f43; }
        .timeline-dot.absent { background: #ea5455; }
        .entry-main { flex: 1; }
        .entry-type { font-size: 13px; font-weight: 700; color: white; display: block; }
        .entry-time { font-size: 10px; color: rgba(255,255,255,0.3); }
        .entry-status-badge { font-size: 9px; font-weight: 900; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
        .entry-status-badge.on_time { background: rgba(40, 199, 111, 0.1); color: #28c76f; }
        .entry-status-badge.late { background: rgba(255, 159, 67, 0.1); color: #ff9f43; }
        .entry-status-badge.absent { background: rgba(234, 84, 85, 0.1); color: #ea5455; }
        .empty-state-text { color: rgba(255,255,255,0.2); font-size: 11px; text-align: center; padding: 10px; }
      `}} />
    </div>
  );
};

const getStreakLabel = (type, t) => {
  const labels = {
    'attendance': t('attendance_title'),
    'homework': t('nav_homework'),
    'all_lessons': t('streak_all_lessons'),
    'star_homework': t('streak_star_homework')
  };
  return labels[type] || type;
};

export default ParentDashboard;

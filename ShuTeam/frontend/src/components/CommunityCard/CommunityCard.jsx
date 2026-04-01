import React from 'react';
import './CommunityCard.css';
import { Lock, Unlock, Globe, ChevronRight, CheckCircle2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityCard = ({ community, isJoined }) => {
  const navigate = useNavigate();
  const { id, name, description, type, category, avatar_url } = community;

  const renderPrivacyBadge = () => {
    switch(type) {
      case 'open': return <div className="badge open"><Globe size={14} /> Открытое</div>;
      case 'partial': return <div className="badge partial"><Unlock size={14} /> Частично</div>;
      case 'closed': return <div className="badge closed"><Lock size={14} /> Закрытое</div>;
      default: return null;
    }
  };

  return (
    <div className="community-card-new" onClick={() => navigate(`/community/${id}`)}>
      <div className="card-tags">
        <div className="tag-category">{category}</div>
        {renderPrivacyBadge()}
        {isJoined && <div className="badge member"><CheckCircle2 size={14} /> Вы состоите</div>}
      </div>
      
      <div className="card-main">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
          {avatar_url ? (
            <img src={avatar_url} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="c-icon" />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#888" />
            </div>
          )}
          <h3 style={{ margin: 0 }}>{name}</h3>
        </div>
        <p>{description}</p>
      </div>

      <div className="card-actions">
        <button className="join-btn-new">
          {isJoined ? 'Перейти' : 'Вступить'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default CommunityCard;

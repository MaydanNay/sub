import React from 'react';
import { getAvatarColor, getInitials } from '../utils/avatarHelper';

const Avatar = ({ user, size = 40, style = {}, className = "" }) => {
    if (!user) return null;

    const displaySize = typeof size === 'number' ? `${size}px` : size;
    const initials = getInitials(user.full_name || user.username);
    const bgColor = getAvatarColor(user.full_name || user.username);

    const baseStyle = {
        width: displaySize,
        height: displaySize,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontWeight: 'bold',
        fontSize: `calc(${displaySize} / 2.5)`,
        color: 'white',
        flexShrink: 0,
        ...style
    };

    if (user.profile_image) {
        return (
            <div className={className} style={{ ...baseStyle, backgroundColor: '#eee' }}>
                <img 
                    src={user.profile_image} 
                    alt={user.full_name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            </div>
        );
    }

    return (
        <div 
            className={className} 
            style={{ 
                ...baseStyle, 
                backgroundColor: bgColor,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
        >
            {initials}
        </div>
    );
};

export default Avatar;

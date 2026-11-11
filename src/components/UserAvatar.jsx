import React, { useState } from 'react';

export function getInitials(name = '') {
  if (!name) return 'AE';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserAvatar({
  user,
  name,
  avatar,
  role,
  className = 'w-10 h-10 rounded-xl',
  textSize = 'text-xs',
  borderClass = ''
}) {
  const [imgError, setImgError] = useState(false);
  const userName = user?.name || name || 'Kullanıcı';
  const userAvatar = user?.avatar || avatar;
  const isBroker = (user?.role || role) === 'broker';

  const defaultBorder = borderClass || (isBroker ? 'border-amber-400' : 'border-slate-300');

  if (userAvatar && userAvatar.trim() && !imgError) {
    return (
      <img
        src={userAvatar}
        alt={userName}
        className={`${className} object-cover border-2 ${defaultBorder} shadow-xs shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Modern corporate initials badge when photo is not uploaded
  return (
    <div
      className={`${className} bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 text-amber-400 border-2 ${defaultBorder} flex items-center justify-center font-black ${textSize} tracking-tight select-none shadow-xs shrink-0`}
      title={userName}
    >
      {getInitials(userName)}
    </div>
  );
}

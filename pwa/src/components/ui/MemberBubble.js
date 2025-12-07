import React, { useState, useEffect } from 'react';

const MemberBubble = ({ member, onClick, isCenter = false, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getStatusColor = (status) => {
    const colors = {
      Safe: 'from-emerald-500 to-emerald-600',
      Busy: 'from-amber-500 to-amber-600',
      Offline: 'from-gray-500 to-gray-600',
      Help: 'from-rose-500 to-rose-600'
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  const size = isCenter ? 'w-40 h-40' : 'w-28 h-28';
  const textSize = isCenter ? 'text-2xl' : 'text-lg';

  return (
    <div
      onClick={onClick}
      className={`${size} cursor-pointer transition-all duration-500 ease-out ${
        isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-full h-full bg-gradient-to-br ${getStatusColor(member.status)} rounded-full shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:scale-110 transition-transform duration-300`}>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        {member.role === 'owner' && (
          <div className="absolute inset-0 border-4 border-white rounded-full opacity-60" />
        )}
        {member.isMe && (
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <span className="text-white text-xs font-bold">ME</span>
          </div>
        )}
        <div className={`${textSize} font-bold text-white z-10`}>
          {member.name}
        </div>
        <div className="text-sm text-white opacity-80 mt-1 z-10">
          {member.status}
        </div>
      </div>
    </div>
  );
};

export default MemberBubble;

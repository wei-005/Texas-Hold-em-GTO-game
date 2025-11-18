import React from 'react';
import { CardData, Suit } from '../types';

interface CardProps {
  card?: CardData;
  hidden?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ card, hidden, className = '', size = 'md' }) => {
  if (hidden) {
    return (
      <div className={`
        relative bg-blue-800 border-2 border-white rounded-lg shadow-card 
        flex items-center justify-center overflow-hidden
        ${size === 'sm' ? 'w-10 h-14' : size === 'lg' ? 'w-20 h-28' : 'w-16 h-24'}
        ${className}
      `}>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
        <div className="w-full h-full bg-gradient-to-br from-blue-700 to-blue-900"></div>
      </div>
    );
  }

  if (!card) return null;

  const isRed = card.suit === '♥' || card.suit === '♦';
  
  const sizeClasses = {
    sm: 'w-10 h-14 text-xs',
    md: 'w-16 h-24 text-base',
    lg: 'w-20 h-28 text-xl',
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-card flex flex-col items-center justify-between p-1 select-none
      transform transition-transform hover:-translate-y-1
      ${sizeClasses[size]}
      ${isRed ? 'text-red-600' : 'text-black'}
      ${className}
    `}>
      <div className="self-start font-bold leading-none">{card.rank}</div>
      <div className={`text-2xl ${size === 'sm' ? 'text-lg' : ''}`}>{card.suit}</div>
      <div className="self-end font-bold leading-none rotate-180">{card.rank}</div>
    </div>
  );
};

export default Card;
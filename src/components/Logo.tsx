import React, { useState } from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = ''
}) => {
  const [imgSrc, setImgSrc] = useState('https://iili.io/CNnEVFj.png');

  const logoSizes = {
    sm: 'h-8 max-w-[160px]',
    md: 'h-11 max-w-[220px]',
    lg: 'h-16 max-w-[300px]',
    xl: 'h-24 max-w-[380px]',
  };

  const handleImgError = () => {
    if (imgSrc !== 'https://iili.io/CNnEVFj.md.png') {
      setImgSrc('https://iili.io/CNnEVFj.md.png');
    }
  };

  return (
    <div className={`inline-flex items-center justify-center bg-transparent select-none ${className}`} id="logo-container">
      <img
        src={imgSrc}
        alt="Grupo Alexandrita Logo Oficial"
        className={`object-contain ${logoSizes[size]} drop-shadow-xs transition-transform duration-300 hover:scale-[1.02] bg-transparent`}
        id="official-company-logo"
        referrerPolicy="no-referrer"
        onError={handleImgError}
      />
    </div>
  );
};




import React from 'react'

const AutoMarketIcon: React.FC<{ size?: number, className?: string }> = ({ 
  size = 24, 
  className = '' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fondo circular con gradiente */}
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#764ba2', stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      {/* Círculo de fondo */}
      <circle cx="16" cy="16" r="15" fill="url(#grad1)" stroke="currentColor" strokeWidth="2"/>
      
      {/* Cuerpo del auto */}
      <path 
        d="M8 18 L10 15 L12 13 L20 13 L22 15 L24 18 L23 20 L21 21 L11 21 L9 20 Z" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Ventanas */}
      <path 
        d="M11 15 L13 13.5 L19 13.5 L21 15 L20 16 L12 16 Z" 
        fill="#e0e7ff" 
        opacity="0.7"
      />
      
      {/* Ruedas */}
      <circle cx="12" cy="20" r="2.5" fill="#374151" stroke="white" strokeWidth="1"/>
      <circle cx="20" cy="20" r="2.5" fill="#374151" stroke="white" strokeWidth="1"/>
      
      {/* Centros de ruedas */}
      <circle cx="12" cy="20" r="1" fill="white"/>
      <circle cx="20" cy="20" r="1" fill="white"/>
      
      {/* Faros */}
      <circle cx="9.5" cy="17" r="1" fill="#fbbf24" opacity="0.8"/>
      <circle cx="22.5" cy="17" r="1" fill="#fbbf24" opacity="0.8"/>
    </svg>
  )
}

export default AutoMarketIcon
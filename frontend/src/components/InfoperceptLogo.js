import React from 'react';

const InfoperceptLogo = ({ 
  size = 'md', 
  variant = 'default', 
  showText = true, 
  showTagline = false,
  textColor = "text-gray-900" 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const variantClasses = {
    default: 'rounded-xl',
    sidebar: 'rounded-xl shadow-lg',
    auth: 'rounded-xl shadow-xl border border-white/20',
    cyber: 'rounded-xl'
  };

  return (
    <div className="flex items-center">
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} ${variantClasses[variant]} bg-white flex items-center justify-center`}>
        <img 
          src="/infopercept.webp" 
          alt="Infopercept Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Text */}
      {showText && (
        <div className="ml-3">
          <h1 className={`${textSizes[size]} font-bold ${textColor} tracking-tight`}>
            Infopercept
          </h1>
        </div>
      )}
    </div>
  );
};

export default InfoperceptLogo;
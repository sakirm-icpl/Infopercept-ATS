import React from 'react';
import { cn } from '../utils/cn';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'default',
  shadow = 'default',
  rounded = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    soft: 'shadow-soft',
    colored: 'shadow-colored'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-lg',
    default: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-4xl'
  };

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 transition-all duration-300',
        paddingClasses[padding],
        shadowClasses[shadow],
        roundedClasses[rounded],
        hover && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div
    className={cn(
      'border-b border-gray-200 pb-4 mb-6',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardBody = ({ children, className = '', ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={cn(
      'border-t border-gray-200 pt-4 mt-6',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
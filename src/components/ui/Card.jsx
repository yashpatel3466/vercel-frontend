import React from 'react';
import { theme } from '../theme/theme';

export const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  style = {},
  ...props 
}) => {
  const baseStyles = {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.ease}`,
    border: `1px solid ${theme.colors.neutral[200]}`,
    ...style
  };

  const variants = {
    default: {},
    elevated: {
      boxShadow: theme.shadows.lg,
    },
    outlined: {
      border: `2px solid ${theme.colors.primary[200]}`,
      boxShadow: 'none',
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: `1px solid rgba(255, 255, 255, 0.2)`,
    },
  };

  const paddings = {
    none: { padding: '0' },
    sm: { padding: theme.spacing[3] },
    md: { padding: theme.spacing[6] },
    lg: { padding: theme.spacing[8] },
    xl: { padding: theme.spacing[12] },
  };

  const shadows_map = {
    none: 'none',
    sm: theme.shadows.sm,
    md: theme.shadows.md,
    lg: theme.shadows.lg,
    xl: theme.shadows.xl,
    '2xl': theme.shadows['2xl'],
  };

  const cardStyle = {
    ...baseStyles,
    ...variants[variant],
    ...paddings[padding],
    boxShadow: shadows_map[shadow],
    ...(hover && {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows.xl,
      },
    }),
  };

  return (
    <div
      style={cardStyle}
      className={`${className} ${hover ? 'hover-card' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', style = {}, ...props }) => (
  <div
    style={{
      marginBottom: theme.spacing[4],
      paddingBottom: theme.spacing[4],
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </div>
);

export const CardBody = ({ children, className = '', style = {}, ...props }) => (
  <div
    style={{
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', style = {}, ...props }) => (
  <div
    style={{
      marginTop: theme.spacing[4],
      paddingTop: theme.spacing[4],
      borderTop: `1px solid ${theme.colors.neutral[200]}`,
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </div>
);

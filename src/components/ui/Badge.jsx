import React from 'react';
import { theme } from '../theme/theme';

export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  style = {},
  ...props 
}) => {
  const baseStyles = {
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.full,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
    ...style
  };

  const variants = {
    default: {
      backgroundColor: theme.colors.primary[100],
      color: theme.colors.primary[800],
    },
    primary: {
      backgroundColor: theme.colors.primary[600],
      color: theme.colors.white,
    },
    secondary: {
      backgroundColor: theme.colors.secondary[100],
      color: theme.colors.secondary[800],
    },
    success: {
      backgroundColor: theme.colors.success[100],
      color: theme.colors.success[800],
    },
    warning: {
      backgroundColor: theme.colors.warning[100],
      color: theme.colors.warning[800],
    },
    error: {
      backgroundColor: theme.colors.error[100],
      color: theme.colors.error[800],
    },
    neutral: {
      backgroundColor: theme.colors.neutral[100],
      color: theme.colors.neutral[800],
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `1px solid ${theme.colors.primary[300]}`,
    },
  };

  const sizes = {
    sm: {
      fontSize: theme.typography.fontSize.xs,
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      minHeight: '1.25rem',
    },
    md: {
      fontSize: theme.typography.fontSize.sm,
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      minHeight: '1.5rem',
    },
    lg: {
      fontSize: theme.typography.fontSize.base,
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      minHeight: '2rem',
    },
  };

  const badgeStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  };

  return (
    <span
      style={badgeStyle}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
};

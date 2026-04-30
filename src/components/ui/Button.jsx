import React from 'react';
import { theme } from '../theme/theme';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  onClick,
  className = '',
  style = {},
  ...props 
}) => {
  const baseStyles = {
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.lg,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.ease}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  const variants = {
    primary: {
      backgroundColor: disabled ? theme.colors.neutral[300] : theme.colors.primary[600],
      color: theme.colors.white,
      '&:hover': {
        backgroundColor: disabled ? theme.colors.neutral[300] : theme.colors.primary[700],
        transform: disabled ? 'none' : 'translateY(-1px)',
        boxShadow: disabled ? 'none' : theme.shadows.md,
      },
    },
    secondary: {
      backgroundColor: theme.colors.white,
      color: theme.colors.primary[600],
      border: `1px solid ${theme.colors.primary[300]}`,
      '&:hover': {
        backgroundColor: theme.colors.primary[50],
        transform: disabled ? 'none' : 'translateY(-1px)',
        boxShadow: disabled ? 'none' : theme.shadows.md,
      },
    },
    success: {
      backgroundColor: disabled ? theme.colors.neutral[300] : theme.colors.success[600],
      color: theme.colors.white,
      '&:hover': {
        backgroundColor: disabled ? theme.colors.neutral[300] : theme.colors.success[700],
        transform: disabled ? 'none' : 'translateY(-1px)',
        boxShadow: disabled ? 'none' : theme.shadows.md,
      },
    },
    danger: {
      backgroundColor: disabled ? theme.colors.neutral[300] : theme.colors.error[600],
      color: theme.colors.white,
      '&:hover': {
        backgroundColor: disabled ? theme.colors.neutral[300] : theme.colors.error[700],
        transform: disabled ? 'none' : 'translateY(-1px)',
        boxShadow: disabled ? 'none' : theme.shadows.md,
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `2px solid ${theme.colors.primary[600]}`,
      '&:hover': {
        backgroundColor: theme.colors.primary[50],
        transform: disabled ? 'none' : 'translateY(-1px)',
        boxShadow: disabled ? 'none' : theme.shadows.md,
      },
    },
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
      minHeight: '2rem',
    },
    md: {
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
      minHeight: '2.5rem',
    },
    lg: {
      padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.lg,
      minHeight: '3rem',
    },
  };

  const buttonStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${className} ${loading ? 'loading' : ''}`}
      {...props}
    >
      {loading && (
        <div 
          style={{
            width: '1rem',
            height: '1rem',
            border: '2px solid transparent',
            borderTop: `2px solid ${theme.colors.white}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};

// Add CSS animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading {
    opacity: 0.7;
  }
`;
document.head.appendChild(style);

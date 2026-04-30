import React from 'react';
import { theme } from '../theme/theme';

export const Input = ({ 
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  className = '',
  style = {},
  ...props 
}) => {
  const baseStyles = {
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontSize: theme.typography.fontSize.base,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.neutral[300]}`,
    backgroundColor: theme.colors.white,
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
    outline: 'none',
    width: '100%',
    ...style
  };

  const variants = {
    default: {
      '&:focus': {
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 3px ${theme.colors.primary[100]}`,
      },
      '&:hover': {
        borderColor: theme.colors.neutral[400],
      },
    },
    outlined: {
      border: `2px solid ${theme.colors.neutral[300]}`,
      '&:focus': {
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 3px ${theme.colors.primary[100]}`,
      },
    },
    filled: {
      backgroundColor: theme.colors.neutral[50],
      border: `1px solid transparent`,
      '&:focus': {
        backgroundColor: theme.colors.white,
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 3px ${theme.colors.primary[100]}`,
      },
    },
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
      fontSize: theme.typography.fontSize.lg,
    },
  };

  const inputStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...(error && {
      borderColor: theme.colors.error[500],
      '&:focus': {
        borderColor: theme.colors.error[500],
        boxShadow: `0 0 0 3px ${theme.colors.error[100]}`,
      },
    }),
  };

  return (
    <div style={{ marginBottom: theme.spacing[4] }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: theme.spacing[2],
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.neutral[700],
          }}
        >
          {label}
        </label>
      )}
      <input
        style={inputStyle}
        className={className}
        {...props}
      />
      {(error || helperText) && (
        <div
          style={{
            marginTop: theme.spacing[1],
            fontSize: theme.typography.fontSize.xs,
            color: error ? theme.colors.error[600] : theme.colors.neutral[600],
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export const Textarea = ({ 
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  rows = 4,
  className = '',
  style = {},
  ...props 
}) => {
  const baseStyles = {
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontSize: theme.typography.fontSize.base,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.neutral[300]}`,
    backgroundColor: theme.colors.white,
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
    outline: 'none',
    width: '100%',
    resize: 'vertical',
    ...style
  };

  const variants = {
    default: {
      '&:focus': {
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 3px ${theme.colors.primary[100]}`,
      },
      '&:hover': {
        borderColor: theme.colors.neutral[400],
      },
    },
    outlined: {
      border: `2px solid ${theme.colors.neutral[300]}`,
      '&:focus': {
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 3px ${theme.colors.primary[100]}`,
      },
    },
    filled: {
      backgroundColor: theme.colors.neutral[50],
      border: `1px solid transparent`,
      '&:focus': {
        backgroundColor: theme.colors.white,
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 3px ${theme.colors.primary[100]}`,
      },
    },
  };

  const sizes = {
    sm: {
      padding: theme.spacing[2],
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      padding: theme.spacing[3],
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      padding: theme.spacing[4],
      fontSize: theme.typography.fontSize.lg,
    },
  };

  const textareaStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...(error && {
      borderColor: theme.colors.error[500],
      '&:focus': {
        borderColor: theme.colors.error[500],
        boxShadow: `0 0 0 3px ${theme.colors.error[100]}`,
      },
    }),
  };

  return (
    <div style={{ marginBottom: theme.spacing[4] }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: theme.spacing[2],
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.neutral[700],
          }}
        >
          {label}
        </label>
      )}
      <textarea
        style={textareaStyle}
        rows={rows}
        className={className}
        {...props}
      />
      {(error || helperText) && (
        <div
          style={{
            marginTop: theme.spacing[1],
            fontSize: theme.typography.fontSize.xs,
            color: error ? theme.colors.error[600] : theme.colors.neutral[600],
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
};

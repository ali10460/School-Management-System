import { useState, useCallback } from 'react';

// Validation rule builders
export const validators = {
  required: (msg = 'This field is required') => (value) => {
    if (value === null || value === undefined || String(value).trim() === '') return msg;
    return null;
  },
  email: (msg = 'Please enter a valid email') => (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : msg;
  },
  minLength: (min, msg) => (value) => {
    if (!value) return null;
    return String(value).length >= min ? null : (msg || `Must be at least ${min} characters`);
  },
  maxLength: (max, msg) => (value) => {
    if (!value) return null;
    return String(value).length <= max ? null : (msg || `Must be no more than ${max} characters`);
  },
  numeric: (msg = 'Must be a valid number') => (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return !isNaN(Number(value)) ? null : msg;
  },
  min: (minVal, msg) => (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value) >= minVal ? null : (msg || `Must be at least ${minVal}`);
  },
  match: (otherValue, msg = 'Values do not match') => (value) => {
    return value === otherValue ? null : msg;
  },
  url: (msg = 'Please enter a valid URL') => (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return msg;
    }
  },
  pattern: (regex, msg = 'Invalid format') => (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return regex.test(value) ? null : msg;
  }
};

/**
 * Custom hook for form validation.
 * 
 * @param {Object} rules - An object mapping field names to arrays of validator functions.
 *   e.g. { email: [validators.required(), validators.email()] }
 * @returns {{ errors, validateField, validateForm, clearErrors, setFieldError }}
 */
const useFormValidation = (rules = {}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const fieldRules = rules[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
      }
    }
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    return null;
  }, [rules]);

  const touchField = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = useCallback((formData) => {
    const newErrors = {};
    let isValid = true;

    for (const [name, fieldRules] of Object.entries(rules)) {
      const value = formData[name];
      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          newErrors[name] = error;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(rules).forEach(key => { allTouched[key] = true; });
    setTouched(allTouched);
    return isValid;
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const setFieldError = useCallback((name, error) => {
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, []);

  const getFieldError = useCallback((name) => {
    return touched[name] ? errors[name] : undefined;
  }, [errors, touched]);

  return { errors, touched, validateField, validateForm, clearErrors, setFieldError, touchField, getFieldError };
};

export default useFormValidation;

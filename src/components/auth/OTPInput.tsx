'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  disabled?: boolean;
}

export default function OTPInput({ length = 6, onComplete, onChange, disabled = false }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    } else if (value) {
      setFocusedIndex(index);
    }

    const code = newValues.join('');
    onChange?.(code);

    if (code.length === length && !newValues.includes('')) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
      const newValues = [...values];
      newValues[index - 1] = '';
      setValues(newValues);
      onChange?.(newValues.join(''));
    }
    if (e.key === 'ArrowLeft' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
    if (e.key === 'ArrowRight' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newValues = [...values];
    pastedData.split('').forEach((char, i) => {
      if (i < length) newValues[i] = char;
    });
    setValues(newValues);

    const focusTarget = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusTarget]?.focus();
    setFocusedIndex(focusTarget);

    const code = newValues.join('');
    onChange?.(code);

    if (code.length === length && !newValues.includes('')) {
      onComplete(code);
    }
  };

  return (
    <div className="flex justify-between w-full gap-2" dir="ltr">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={() => setFocusedIndex(index)}
          disabled={disabled}
          className={`w-12 h-14 bg-surface/50 border border-outline-variant rounded-xl text-center text-xl font-semibold text-on-surface focus:border-tertiary-fixed focus:ring-2 focus:ring-tertiary-fixed outline-none transition-all shadow-sm
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      ))}
    </div>
  );
}

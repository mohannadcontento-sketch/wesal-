'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export default function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
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
    if (code.length === length && !newValues.includes('')) {
      onComplete(code);
    }
  };

  return (
    <div className="flex gap-2.5 sm:gap-3 justify-center" dir="ltr">
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
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold tracking-wider rounded-lg border-2 transition-all duration-200 outline-none
            ${value
              ? 'border-teal-500 bg-teal-50 text-teal-700'
              : focusedIndex === index
                ? 'border-teal-400 ring-2 ring-teal-100'
                : 'border-gray-200 bg-white text-gray-900'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

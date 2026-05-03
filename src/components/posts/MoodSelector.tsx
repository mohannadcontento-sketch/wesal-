'use client';

import { useState, useRef, useEffect } from 'react';

const MOODS = [
  { emoji: '😊', label: 'سعيد' },
  { emoji: '❤️', label: 'حب' },
  { emoji: '😢', label: 'حزين' },
  { emoji: '💪', label: 'قوي' },
  { emoji: '🙏', label: 'امتنان' },
  { emoji: '🤔', label: 'تفكير' },
  { emoji: '😤', label: 'غاضب' },
  { emoji: '🥺', label: 'يائس' },
  { emoji: '✨', label: 'إلهام' },
  { emoji: '🔥', label: 'حماس' },
  { emoji: '💔', label: 'ألم' },
  { emoji: '🌈', label: 'أمل' },
];

export function MoodSelector({ selected, onChange }: { selected: string[]; onChange: (moods: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggle = (mood: string) => {
    if (selected.includes(mood)) {
      onChange(selected.filter((m) => m !== mood));
    } else if (selected.length < 5) {
      onChange([...selected, mood]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-full transition-colors ${
          open ? 'text-primary-container bg-primary-container/10' : 'text-on-surface-variant hover:bg-surface-container'
        }`}
        title="مشاعر"
      >
        <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_0_rgba(23,42,57,0.08)] p-3 z-50 min-w-[240px]">
          <p className="text-xs text-on-surface-variant mb-2 font-semibold">اختر مشاعرك (حد أقصى 5)</p>
          <div className="grid grid-cols-4 gap-1">
            {MOODS.map((mood) => (
              <button
                key={mood.emoji}
                type="button"
                onClick={() => toggle(mood.emoji)}
                title={mood.label}
                className={`relative rounded-xl p-2 text-lg transition-all duration-200 hover:bg-primary-container/10 ${
                  selected.includes(mood.emoji)
                    ? 'bg-primary-container/10 ring-2 ring-primary-container/30'
                    : ''
                }`}
              >
                {mood.emoji}
                {selected.includes(mood.emoji) && (
                  <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-primary-container rounded-full" />
                )}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="flex gap-1 mt-2 pt-2 border-t border-outline-variant/30 flex-wrap">
              {selected.map((mood) => (
                <span key={mood} className="text-sm">{mood}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

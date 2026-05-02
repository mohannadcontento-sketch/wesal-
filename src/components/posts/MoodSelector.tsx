'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';

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

const MOOD_EMOJIS = MOODS.map((m) => m.emoji);

export function MoodSelector({ selected, onChange }: { selected: string[]; onChange: (moods: string[]) => void }) {
  const [open, setOpen] = useState(false);

  const toggle = (mood: string) => {
    if (selected.includes(mood)) {
      onChange(selected.filter((m) => m !== mood));
    } else if (selected.length < 5) {
      onChange([...selected, mood]);
    }
  };

  return (
    <div className="relative flex items-center gap-1.5">
      <button
        onClick={() => setOpen(!open)}
        className={`btn btn-ghost btn-sm gap-1.5 text-caption ${open ? 'text-primary bg-primary-50' : 'text-text-tertiary'}`}
      >
        <Smile className="w-4 h-4" />
        مشاعر
      </button>
      {selected.length > 0 && (
        <div className="flex gap-0.5">
          {selected.map((mood) => (
            <motion.span
              key={mood}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-sm"
            >
              {mood}
            </motion.span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-2 z-50 card-elevated p-3 shadow-lg min-w-[200px]"
            >
              <p className="text-caption text-text-tertiary mb-2 font-semibold">اختر مشاعرك (حد أقصى 5)</p>
              <div className="grid grid-cols-4 gap-1">
                {MOODS.map((mood) => (
                  <button
                    key={mood.emoji}
                    onClick={() => toggle(mood.emoji)}
                    title={mood.label}
                    className={`relative rounded-xl p-2 text-lg transition-all duration-200 hover:bg-primary-50 ${
                      selected.includes(mood.emoji)
                        ? 'bg-primary-light ring-2 ring-primary/30'
                        : ''
                    }`}
                  >
                    {mood.emoji}
                    {selected.includes(mood.emoji) && (
                      <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

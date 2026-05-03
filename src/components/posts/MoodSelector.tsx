'use client';

import { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

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

  const toggle = (mood: string) => {
    if (selected.includes(mood)) {
      onChange(selected.filter((m) => m !== mood));
    } else if (selected.length < 5) {
      onChange([...selected, mood]);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 text-xs ${open ? 'text-teal-600 bg-teal-50' : 'text-gray-400'}`}
          >
            <Smile className="w-4 h-4" />
            مشاعر
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-auto min-w-[220px] p-3">
          <p className="text-xs text-gray-500 mb-2 font-semibold">اختر مشاعرك (حد أقصى 5)</p>
          <div className="grid grid-cols-4 gap-1">
            {MOODS.map((mood) => (
              <button
                key={mood.emoji}
                onClick={() => toggle(mood.emoji)}
                title={mood.label}
                className={`relative rounded-xl p-2 text-lg transition-all duration-200 hover:bg-teal-50 ${
                  selected.includes(mood.emoji)
                    ? 'bg-teal-50 ring-2 ring-teal-600/30'
                    : ''
                }`}
              >
                {mood.emoji}
                {selected.includes(mood.emoji) && (
                  <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-teal-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex gap-0.5">
          {selected.map((mood) => (
            <span key={mood} className="text-sm">
              {mood}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

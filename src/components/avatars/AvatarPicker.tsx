'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AvatarSet } from './AvatarSet';
import { toast } from 'sonner';

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string;
  onConfirm: (avatarId: string) => void;
}

export function AvatarPicker({
  open,
  onOpenChange,
  currentAvatar,
  onConfirm,
}: AvatarPickerProps) {
  const [selected, setSelected] = useState<string>(currentAvatar || '');

  // Sync selected when currentAvatar changes (e.g. after avatar update from outside)
  useEffect(() => {
    setSelected(currentAvatar || '');
  }, [currentAvatar]);

  const handleSelect = (avatarId: string) => {
    setSelected(avatarId);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      const res = await fetch('/api/profiles/me/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: selected }),
      });

      if (res.ok) {
        onConfirm(selected);
        onOpenChange(false);
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ في تغيير الصورة');
      }
    } catch {
      toast.error('حصل خطأ، تأكد من اتصالك بالإنترنت');
    }
  };

  const handleCancel = () => {
    setSelected(currentAvatar || '');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-right pb-2">
          <SheetTitle className="text-xl font-bold text-wesal-dark">
            اختر صورتك الشخصية
          </SheetTitle>
          <SheetDescription className="text-wesal-medium text-sm">
            اختر صورة تعبر عن شخصيتك
          </SheetDescription>
        </SheetHeader>

        {/* Avatar grid - scrollable area */}
        <div className="flex-1 overflow-y-auto px-1 py-2 max-h-[55vh] custom-scrollbar">
          <AvatarSet currentAvatar={selected} onSelect={handleSelect} />
        </div>

        <SheetFooter className="flex-row gap-3 pt-2 pb-2 border-t border-wesal-ice">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 rounded-xl border-wesal-sky/40 text-wesal-medium hover:bg-wesal-ice/60"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 rounded-xl bg-wesal-dark text-white hover:bg-wesal-navy disabled:opacity-50"
          >
            تأكيد
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

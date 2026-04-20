'use client';

import { useState } from 'react';
import { Shield, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Emergency Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg emergency-pulse flex items-center justify-center transition-all duration-200 hover:scale-110"
        aria-label="مساعدة فورية"
      >
        <Shield size={24} />
      </button>

      {/* Emergency Dialog */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-card border-red-200 max-w-md" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-xl flex items-center gap-2">
              <Shield size={24} />
              تحتاج مساعدة فورية؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/80 text-sm leading-relaxed pt-2">
              لو أنت أو حاسس إن في حد قريب منك بيحتاج مساعدة فورية، محدش لازم يواجه الحاجات دي لوحده. هنا مصادر ممكن تساعدك دلوقتي:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-2">
            {/* Egypt Emergency Line */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-red-700 text-sm">خط الطوارئ النفسي - مصر</h4>
                  <p className="text-red-600 font-bold text-lg" dir="ltr">2080</p>
                </div>
              </div>
              <p className="text-red-600/70 text-xs">مجاني - متاح ٢٤ ساعة</p>
            </div>

            {/* General Help */}
            <div className="bg-secondary border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">خط نجدة الأطفال</h4>
                  <p className="text-accent font-bold text-lg" dir="ltr">16000</p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">متاح من ٨ صباحاً لـ ٨ مساءً</p>
            </div>

            {/* Supportive message */}
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <p className="text-sm text-foreground/70">
                مش لازم تواجه الوحدة لوحدك. في ناس كتير حاضرين يساعدوك ويفهموك. انت مهم وحيواتك ليها قيمة كبيرة.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="m-0 bg-card text-foreground border-border hover:bg-secondary">
              شكراً، أنا بأمان
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

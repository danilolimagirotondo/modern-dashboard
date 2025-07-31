import { useEffect, useRef } from 'react';

export function useScrollDebug() {
  const debugModeRef = useRef(false);
  const lastResetTimeRef = useRef(0);

  useEffect(() => {
    // Enable debug mode only in development
    if (process.env.NODE_ENV === 'development') {
      debugModeRef.current = true;
    }

    if (!debugModeRef.current) return;

    let consecutiveWarnings = 0;
    const maxConsecutiveWarnings = 2;

    const checkScrollState = () => {
      const currentBodyOverflow = document.body.style.overflow;
      const openModals = document.querySelectorAll('[data-modal-open="true"]');
      const hasOpenModals = openModals.length > 0;

      // Check if body is hidden without modals
      if (currentBodyOverflow === 'hidden' && !hasOpenModals) {
        consecutiveWarnings++;
        
        const now = Date.now();
        const timeSinceLastReset = now - lastResetTimeRef.current;
        
        // Only warn if it's been a while since last reset to avoid spam
        if (timeSinceLastReset > 5000) {
          console.warn(`[ScrollDebug] ⚠️  Body overflow is hidden but no modals are open! (Warning #${consecutiveWarnings})`);
          
          // Auto-reset after a few warnings
          if (consecutiveWarnings >= maxConsecutiveWarnings) {
            console.log('[ScrollDebug] 🔧 Auto-resetting body overflow due to repeated warnings...');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            lastResetTimeRef.current = now;
            consecutiveWarnings = 0;
          }
        }
      } else {
        // Reset counter if everything is normal
        consecutiveWarnings = 0;
      }
    };

    // Check less frequently to reduce performance impact
    const intervalId = setInterval(checkScrollState, 5000);

    // Initial check
    checkScrollState();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Return a function to manually reset scroll
  const resetScroll = () => {
    console.log('[ScrollDebug] 🔧 Manual scroll reset triggered');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    lastResetTimeRef.current = Date.now();
  };

  return { resetScroll };
}
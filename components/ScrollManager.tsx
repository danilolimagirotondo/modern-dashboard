import { useEffect } from 'react';
import { useScrollDebug } from './useScrollDebug';

// Component to manage and reset body scroll as a safety net
export function ScrollManager() {
  const { resetScroll } = useScrollDebug();

  useEffect(() => {
    // Function to reset body scroll
    const resetBodyScroll = () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };

    // Aggressive check on mount and focus
    const performSafetyCheck = () => {
      const modals = document.querySelectorAll('[data-modal-open="true"]');
      const hasOpenModals = modals.length > 0;
      
      if (!hasOpenModals && document.body.style.overflow === 'hidden') {
        console.warn('[ScrollManager] 🔧 Safety check: Resetting orphaned scroll lock');
        resetBodyScroll();
      }
    };

    // Immediate safety check on mount
    performSafetyCheck();

    // Check when window regains focus (user returns to tab)
    const handleFocus = () => {
      setTimeout(performSafetyCheck, 100); // Small delay to let any modals settle
    };

    // Check when document becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(performSafetyCheck, 100);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic safety check (less frequent)
    const intervalId = setInterval(performSafetyCheck, 15000); // Every 15 seconds

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Final safety reset
      resetBodyScroll();
    };
  }, [resetScroll]);

  return null; // This component doesn't render anything
}

// Hook to manually reset scroll
export function useScrollReset() {
  const resetScroll = () => {
    console.log('[ScrollReset] 🔧 Manual scroll reset triggered');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  return resetScroll;
}
import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  showClose?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'filter';
}

// Global modal counter to track active modals
let activeModalCount = 0;

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth,
  showClose = true,
  className = "",
  size = 'md'
}: ModalProps) {
  const modalIdRef = useRef(`modal-${Math.random().toString(36).substr(2, 9)}`);
  const hasSetScrollRef = useRef(false);

  // ✨ Premium Size Configurations with generous spacing
  const sizeConfigs = {
    sm: 'w-full max-w-md',           // 28rem - Small modals (confirmations)
    md: 'w-full max-w-2xl',         // 42rem - Standard modals (forms)  
    lg: 'w-full max-w-4xl',         // 56rem - Large content modals
    xl: 'w-full max-w-6xl',         // 72rem - Extra large (detailed views)
    full: 'w-full max-w-7xl',       // 80rem - Full-featured modals
    filter: 'w-full max-w-[900px]'  // Custom for filter modals with plenty of space
  };

  const modalSize = maxWidth || sizeConfigs[size];

  // Track modal state and manage body scroll lock
  useEffect(() => {
    if (isOpen) {
      activeModalCount++;
      hasSetScrollRef.current = true;

      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      if (document.body.style.overflow !== 'hidden') {
        // Calculate scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // Apply scroll lock with proper padding compensation
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
      
      return () => {
        if (hasSetScrollRef.current) {
          activeModalCount = Math.max(0, activeModalCount - 1);
          
          // Only restore scroll if this was the last modal
          if (activeModalCount === 0) {
            document.body.style.overflow = originalOverflow || '';
            document.body.style.paddingRight = originalPaddingRight || '';
          }
          
          hasSetScrollRef.current = false;
        }
      };
    }
  }, [isOpen]);

  // Handle escape key with accessibility
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
      if (hasSetScrollRef.current) {
        activeModalCount = Math.max(0, activeModalCount - 1);
        
        if (activeModalCount === 0) {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  // 🎭 Premium Animation Variants
  const backdropVariants = {
    hidden: { 
      opacity: 0,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const modalVariants = {
    hidden: { 
      scale: 0.95,
      opacity: 0,
      y: 10,
      transition: { 
        duration: 0.2, 
        ease: [0.4, 0, 0.2, 1] 
      }
    },
    visible: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1],
        // Slight stagger for elements inside
        staggerChildren: 0.05
      }
    }
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center"
          style={{ zIndex: 999999 }}
          data-modal-open="true"
          data-modal-id={modalIdRef.current}
        >
          {/* 🌊 Enhanced Premium Backdrop with Blur */}
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background: 'var(--modal-backdrop, rgba(0, 0, 0, 0.85))'
            }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* 📱 Premium Responsive Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div 
              className={`
                relative ${modalSize}
                ${size === 'filter' ? 'min-w-[320px] sm:min-w-[700px] lg:min-w-[800px]' : 'min-w-[320px]'}
                w-full
                max-w-[96vw] sm:max-w-[92vw] lg:max-w-[90vw]
                max-h-[96vh] sm:max-h-[94vh] lg:max-h-[92vh]
                mx-auto
                bg-card rounded-2xl shadow-2xl border border-border
                overflow-hidden flex flex-col
                ${className}
              `}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* ❌ Premium Close Button */}
              {showClose && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 h-10 w-10 p-0 rounded-xl bg-background/95 hover:bg-muted shadow-lg border border-border transition-all duration-200 backdrop-blur-sm"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">Fechar modal</span>
                  </Button>
                </motion.div>
              )}
              
              {/* 📄 Modal Content Container */}
              <motion.div 
                className="flex-1 min-h-0 overflow-hidden"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.25 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  // Use React Portal to render modal outside of normal DOM hierarchy
  return createPortal(modalContent, document.body);
}

/*
🎨 PREMIUM MODAL STYLES - Applied via CSS

Usage Examples:

// Small confirmation modal
<Modal size="sm" isOpen={isOpen} onClose={onClose}>
  <div className="p-8">Confirmation content</div>
</Modal>

// Standard form modal (default)
<Modal isOpen={isOpen} onClose={onClose}>
  <div className="flex flex-col h-full">
    <div className="p-8">Form content</div>
  </div>
</Modal>

// Large content modal
<Modal size="lg" isOpen={isOpen} onClose={onClose}>
  <div className="flex flex-col h-full">
    <div className="p-10">Large content</div>
  </div>
</Modal>

// Filter modal with custom spacing
<Modal size="filter" isOpen={isOpen} onClose={onClose}>
  <div className="p-8">Filter content</div>
</Modal>

// Custom size modal
<Modal maxWidth="max-w-5xl" isOpen={isOpen} onClose={onClose}>
  <div className="p-8">Custom content</div>
</Modal>

Key Features:
✨ Smooth animations with motion/react
📱 Perfect responsive behavior 
🎨 Premium shadow and backdrop blur
♿ Full accessibility (ARIA, keyboard navigation)
🔒 Proper scroll lock management
🎯 Multiple size presets
💫 Staggered content animations
🎪 Dark mode support via CSS variables
*/
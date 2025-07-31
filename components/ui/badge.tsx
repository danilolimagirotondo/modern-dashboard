import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

// 🏷️ Premium Badge Variants with Enhanced Styling
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        // Standard variants
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
          
        // 🎨 Premium Status Badge Variants
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/90",
        info:
          "border-transparent bg-info text-info-foreground hover:bg-info/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { 
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "span";

  // 🎨 Handle premium badge classes defined in CSS
  const premiumClasses = [
    'badge-success',
    'badge-warning', 
    'badge-danger',
    'badge-info',
    'badge-purple'
  ];

  // Check if className contains a premium class
  const hasPremiumClass = premiumClasses.some(cls => className?.includes(cls));

  return (
    <Comp
      data-slot="badge"
      className={
        hasPremiumClass 
          ? cn(
              // Base premium badge styles
              "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden shadow-sm border-0",
              className
            )
          : cn(badgeVariants({ variant }), className)
      }
      {...props}
    />
  );
}

export { Badge, badgeVariants };

{/* 🎨 PREMIUM BADGE USAGE EXAMPLES:

// Standard variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>

// Premium CSS classes (defined in globals.css)
<Badge className="badge-success">✅ Completed</Badge>
<Badge className="badge-warning">⚠️ Pending</Badge>
<Badge className="badge-danger">🚨 Overdue</Badge>
<Badge className="badge-info">ℹ️ Review</Badge>
<Badge className="badge-purple">💜 Special</Badge>

// With icons
<Badge className="badge-success">
  <CheckCircle className="h-3 w-3" />
  Active
</Badge>

// Dark mode automatic
<Badge className="badge-warning">
  <Clock className="h-3 w-3" />
  Medium Priority
</Badge>

Key Features:
🎨 Premium rounded-full design with generous padding (12px horizontal)
🏷️ Enhanced font-semibold weight for better visibility
✨ Smooth transitions and hover states
🌙 Perfect dark mode support via CSS variables
💫 Support for icons with proper spacing
📏 Consistent sizing and typography
♿ Full accessibility support
🎯 Both variant system and CSS class support
*/}
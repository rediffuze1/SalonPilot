import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassmorphismButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

const GlassmorphismButton = forwardRef<HTMLButtonElement, GlassmorphismButtonProps>(
  ({ children, className, variant = "primary", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          variant === "primary" && "btn-primary",
          variant === "secondary" && "btn-secondary",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GlassmorphismButton.displayName = "GlassmorphismButton";

export default GlassmorphismButton;

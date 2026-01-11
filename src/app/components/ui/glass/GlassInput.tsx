import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useRef, useEffect, useImperativeHandle } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  multiline?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, any>(
  ({ icon, className = "", multiline = false, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
    useImperativeHandle(ref, () => internalRef.current as any);

    useEffect(() => {
      if (multiline && internalRef.current) {
        const textarea = internalRef.current as HTMLTextAreaElement;
        textarea.style.height = 'auto'; // Reset height to shrink if text is deleted
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
      }
    }, [props.value, multiline]);

    const commonClasses = `
      w-full px-4 py-2.5 rounded-xl
      bg-[var(--glass-background)] border border-[var(--glass-border)]
      backdrop-blur-[12px]
      placeholder:text-muted-foreground
      focus:outline-none focus:ring-2 focus:ring-purple-500/50
      transition-all duration-200
      max-h-40
      ${icon ? "pl-10" : ""}
      ${className}
    `;

    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
            {icon}
          </div>
        )}
        
        {multiline ? (
          <textarea
            ref={internalRef as any}
            rows={1}
            className={`${commonClasses} resize-none py-3 overflow-y-hidden`}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={internalRef as any}
            className={commonClasses}
            {...props}
          />
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

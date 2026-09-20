import { Calendar } from "lucide-react";
import { useRef, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DateInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Input
        {...props}
        ref={ref}
        type="date"
        className={cn("pr-11 [&::-webkit-calendar-picker-indicator]:opacity-0", className)}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-foreground"
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          if (typeof el.showPicker === "function") el.showPicker();
          else el.focus();
        }}
      >
        <Calendar className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

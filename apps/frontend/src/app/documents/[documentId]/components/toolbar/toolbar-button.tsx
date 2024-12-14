import type { ElementType } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";
import { cn } from "@/web-lib/utils";

export interface ToolbarButtonProps {
  icon: ElementType | null;
  isActive?: boolean;
  label?: string;
  onClick?: () => void;
}

export default function ToolbarButton({
  icon: Icon,
  onClick,
  isActive = false,
  label = "",
}: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {Icon !== null &&
            (label === "Heading" ? (
              <Icon />
            ) : (
              <button
                className={cn(
                  "flex items-center justify-center rounded size-7 hover:bg-[#44474614]",
                  isActive && "bg-[#d2e3fe]",
                )}
                type="button"
                onClick={onClick}
              >
                {Icon !== null && <Icon className="size-5" />}
              </button>
            ))}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

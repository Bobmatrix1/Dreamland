import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { formatDistanceToNow } from "date-fns";

interface StatusIndicatorProps {
  status: 'online' | 'away' | 'offline';
  lastSeen?: { toDate: () => Date } | null;
  showText?: boolean;
}

export function StatusIndicator({ status, lastSeen, showText = true }: StatusIndicatorProps) {
  const getStatusInfo = () => {
    let color = "bg-gray-500"; // ash
    let text = "Offline";

    if (status === 'online') {
      color = "bg-green-500";
      text = "Online";
    } else if (status === 'away') {
      color = "bg-orange-500";
      text = "Away";
    } else if (lastSeen) {
      try {
        const lastSeenDate = lastSeen.toDate();
        text = `Last seen ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`;
      } catch (e) {
        // Fallback for non-timestamp objects
        text = `Last seen recently`;
      }
    }
    
    return { color, text };
  };

  const { color, text } = getStatusInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            {showText && <span className={`text-sm ${status === 'online' ? 'text-green-500' : 'text-muted-foreground'}`}>{text}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

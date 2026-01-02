import { formatPosition, calculateETA } from '@/lib/queue-utils';

interface QueuePositionProps {
  position: number;
  avgServiceTime: number;
  totalInQueue: number;
}

/**
 * Large, prominent queue position display
 * The hero component of the user experience
 */
export function QueuePosition({ position, avgServiceTime, totalInQueue }: QueuePositionProps) {
  const eta = calculateETA(position, avgServiceTime);
  
  return (
    <div className="text-center space-y-6 animate-fade-in">
      {/* Main position number - BIG typography */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-lg font-medium">Your position</p>
        <div className="queue-number leading-none">
          #{position}
        </div>
        <p className="text-muted-foreground text-base">
          {formatPosition(position)} in line
        </p>
      </div>

      {/* ETA display */}
      <div className="queue-card inline-block px-8 py-4">
        <p className="text-muted-foreground text-sm mb-1">Estimated wait</p>
        <p className="text-3xl font-bold text-foreground">{eta}</p>
      </div>

      {/* Queue stats */}
      <div className="flex justify-center gap-8 text-sm text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground">{totalInQueue}</span> people in queue
        </div>
        <div>
          <span className="font-semibold text-foreground">~{avgServiceTime} min</span> per person
        </div>
      </div>
    </div>
  );
}

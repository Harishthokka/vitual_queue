import { forwardRef, useEffect, useRef } from 'react';
import { formatPosition, calculateETA } from '@/lib/queue-utils';
import { useToast } from '@/hooks/use-toast';

interface QueuePositionProps {
  position: number;
  avgServiceTime: number;
  totalInQueue: number;
}

/**
 * Large, prominent queue position display
 * The hero component of the user experience
 */
export const QueuePosition = forwardRef<HTMLDivElement, QueuePositionProps>(
  ({ position, avgServiceTime, totalInQueue }, ref) => {
    const { toast } = useToast();
    const lastNotifiedRef = useRef<number | null>(null);
    
    const etaMinutes = position * avgServiceTime;
    const eta = calculateETA(position, avgServiceTime);
    const isNext = position === 1;
    const isAlmostUp = etaMinutes > 0 && etaMinutes <= 5 && position > 1;

    // Notify when ETA is 3-5 mins or when user is next
    useEffect(() => {
      if (lastNotifiedRef.current === position) return;
      
      if (isNext) {
        toast({ 
          title: "You're next! 🎉", 
          description: "Please get ready - you'll be called shortly!"
        });
        lastNotifiedRef.current = position;
      } else if (isAlmostUp) {
        toast({ 
          title: "Almost your turn!", 
          description: `Estimated wait: ${etaMinutes} minutes`
        });
        lastNotifiedRef.current = position;
      }
    }, [position, isNext, isAlmostUp, etaMinutes, toast]);

    return (
      <div ref={ref} className="text-center space-y-6 animate-fade-in">
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

        {/* ETA display - different for position 1 */}
        <div className={`queue-card inline-block px-8 py-4 ${isNext ? 'bg-primary/10 border-primary/30' : ''}`}>
          {isNext ? (
            <>
              <p className="text-primary text-sm mb-1 font-medium">Get ready!</p>
              <p className="text-3xl font-bold text-primary">You're Next</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm mb-1">Estimated wait</p>
              <p className="text-3xl font-bold text-foreground">{eta}</p>
            </>
          )}
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
);

QueuePosition.displayName = 'QueuePosition';

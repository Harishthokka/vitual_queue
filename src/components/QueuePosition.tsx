import { forwardRef, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatPosition, calculateETA } from '@/lib/queue-utils';
import { useToast } from '@/hooks/use-toast';

interface QueuePositionProps {
  position: number;
  avgServiceTime: number;
  totalInQueue: number;
}

export const QueuePosition = forwardRef<HTMLDivElement, QueuePositionProps>(
  ({ position, avgServiceTime, totalInQueue }, ref) => {
    const { toast } = useToast();
    const lastNotifiedRef = useRef<number | null>(null);
    
    const etaMinutes = position * avgServiceTime;
    const eta = calculateETA(position, avgServiceTime);
    const isNext = position === 1;
    const isAlmostUp = etaMinutes > 0 && etaMinutes <= 5 && position > 1;

    useEffect(() => {
      if (lastNotifiedRef.current === position) return;
      if (isNext) {
        toast({ title: "You're next! 🎉", description: "Please get ready - you'll be called shortly!" });
        lastNotifiedRef.current = position;
      } else if (isAlmostUp) {
        toast({ title: "Almost your turn!", description: `Estimated wait: ${etaMinutes} minutes` });
        lastNotifiedRef.current = position;
      }
    }, [position, isNext, isAlmostUp, etaMinutes, toast]);

    return (
      <div ref={ref} className="text-center space-y-6">
        {/* Main position */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-lg font-medium">Your position</p>
          <motion.div
            key={position}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="queue-number leading-none"
          >
            #{position}
          </motion.div>
          <p className="text-muted-foreground text-base">
            {formatPosition(position)} in line
          </p>
        </div>

        {/* ETA display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`queue-card inline-block px-8 py-5 ${isNext ? 'animate-pulse-glow' : ''}`}
          style={isNext ? { background: 'var(--gradient-primary)' } : {}}
        >
          {isNext ? (
            <>
              <p className="text-primary-foreground/80 text-sm mb-1 font-medium">Get ready!</p>
              <p className="text-3xl font-black text-primary-foreground">You're Next</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm mb-1">Estimated wait</p>
              <p className="text-3xl font-black text-foreground">{eta}</p>
            </>
          )}
        </motion.div>

        {/* Queue stats */}
        <div className="flex justify-center gap-6">
          <div className="stat-card px-5 py-3">
            <span className="font-bold text-foreground text-lg">{totalInQueue}</span>
            <p className="text-xs text-muted-foreground">in queue</p>
          </div>
          <div className="stat-card px-5 py-3">
            <span className="font-bold text-foreground text-lg">~{avgServiceTime}m</span>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
        </div>
      </div>
    );
  }
);

QueuePosition.displayName = 'QueuePosition';

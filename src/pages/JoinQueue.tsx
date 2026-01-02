import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { JoinQueueForm } from '@/components/JoinQueueForm';
import { QueuePosition } from '@/components/QueuePosition';
import { useQueue, useQueueByCode } from '@/hooks/useQueue';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * User Queue page - Join and view position
 */
const JoinQueue = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  // State for user's queue entry
  const [userId, setUserId] = useState<string | null>(() => {
    // Check localStorage for existing entry
    const stored = localStorage.getItem(`queue_entry_${code}`);
    return stored ? JSON.parse(stored).userId : null;
  });
  
  // Find queue by code
  const { queueId, loading: findingQueue, error: findError } = useQueueByCode(code || null);
  
  // Subscribe to queue data
  const { queue, users, loading: loadingQueue, error: queueError } = useQueue(queueId);

  // Find user's current position
  const userEntry = users.find(u => u.id === userId);
  const userPosition = userEntry?.position || 0;

  // Handle successful join
  const handleJoined = (newUserId: string, position: number) => {
    setUserId(newUserId);
    // Store in localStorage so page refresh keeps state
    localStorage.setItem(`queue_entry_${code}`, JSON.stringify({ userId: newUserId }));
  };

  // Handle leave queue
  const handleLeave = async () => {
    if (userId) {
      await supabase
        .from('queue_users')
        .update({ status: 'left' })
        .eq('id', userId);
      
      localStorage.removeItem(`queue_entry_${code}`);
      setUserId(null);
    }
  };

  // Check if user was already served
  useEffect(() => {
    if (userId && users.length > 0 && !userEntry) {
      // User might have been served or left - check
      const checkStatus = async () => {
        const { data } = await supabase
          .from('queue_users')
          .select('status')
          .eq('id', userId)
          .maybeSingle();
        
        if (data?.status === 'served') {
          // Show served message
          localStorage.removeItem(`queue_entry_${code}`);
        }
      };
      checkStatus();
    }
  }, [userId, users, userEntry, code]);

  const loading = findingQueue || loadingQueue;
  const error = findError || queueError;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border/50 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <span className="font-mono text-sm text-muted-foreground tracking-widest">
            {code?.toUpperCase()}
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 animate-pulse">
              <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto animate-spin" />
              <p className="text-muted-foreground mt-4">Finding queue...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12 space-y-4">
              <p className="text-destructive font-medium">Queue not found</p>
              <p className="text-muted-foreground text-sm">
                Check the code and try again
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go Back
              </Button>
            </div>
          )}

          {/* Join Form - Not yet in queue */}
          {queue && !userId && !loading && (
            <div className="queue-card animate-fade-in">
              <JoinQueueForm
                queueId={queue.id}
                queueName={queue.name}
                isPaused={queue.is_paused}
                currentCount={users.length}
                maxCapacity={queue.max_capacity}
                onJoined={handleJoined}
              />
            </div>
          )}

          {/* Position Display - In queue */}
          {queue && userId && userEntry && (
            <div className="space-y-8 animate-fade-in">
              <QueuePosition
                position={userPosition}
                avgServiceTime={queue.avg_service_time}
                totalInQueue={users.length}
              />

              {/* Queue info */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{queue.name}</p>
                {queue.is_paused && (
                  <div className="inline-block bg-warning/10 text-warning px-3 py-1 rounded-full text-xs font-medium mt-2">
                    Queue paused
                  </div>
                )}
              </div>

              {/* Leave option */}
              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={handleLeave} className="text-muted-foreground">
                  Leave Queue
                </Button>
              </div>
            </div>
          )}

          {/* Served State */}
          {queue && userId && !userEntry && !loading && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-success/10 rounded-full mx-auto flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">You're Up!</h2>
                <p className="text-muted-foreground mt-2">
                  It's your turn. Please proceed to the counter.
                </p>
              </div>
              <Button onClick={() => {
                localStorage.removeItem(`queue_entry_${code}`);
                setUserId(null);
              }}>
                Done
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JoinQueue;

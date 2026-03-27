import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { JoinQueueForm } from '@/components/JoinQueueForm';
import { QueuePosition } from '@/components/QueuePosition';
import { useQueue, useQueueByCode } from '@/hooks/useQueue';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const JoinQueue = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState<string | null>(() => {
    const stored = localStorage.getItem(`queue_entry_${code}`);
    return stored ? JSON.parse(stored).userId : null;
  });
  
  const { queueId, loading: findingQueue, error: findError } = useQueueByCode(code || null);
  const { queue, users, loading: loadingQueue, error: queueError } = useQueue(queueId);

  const userEntry = users.find(u => u.id === userId);
  const userPosition = userEntry?.position || 0;

  const handleJoined = (newUserId: string, position: number) => {
    setUserId(newUserId);
    localStorage.setItem(`queue_entry_${code}`, JSON.stringify({ userId: newUserId }));
  };

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

  useEffect(() => {
    if (userId && users.length > 0 && !userEntry) {
      const checkStatus = async () => {
        const { data } = await supabase
          .from('queue_users')
          .select('status')
          .eq('id', userId)
          .maybeSingle();
        if (data?.status === 'served') {
          localStorage.removeItem(`queue_entry_${code}`);
        }
      };
      checkStatus();
    }
  }, [userId, users, userEntry, code]);

  const loading = findingQueue || loadingQueue;
  const error = findError || queueError;

  return (
    <div className="min-h-screen hero-gradient flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob blob-primary w-72 h-72 -top-36 -left-20 animate-float" />
      <div className="blob blob-accent w-56 h-56 bottom-20 -right-16 animate-float-delayed" />

      {/* Header */}
      <header className="sticky top-0 bg-background/60 backdrop-blur-xl border-b border-border/30 z-20">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <span className="font-mono font-bold text-sm text-primary tracking-[0.3em]">
            {code?.toUpperCase()}
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full mx-auto"
                />
                <p className="text-muted-foreground mt-4 font-medium">Finding queue...</p>
              </motion.div>
            )}

            {/* Error State */}
            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl mx-auto flex items-center justify-center">
                  <span className="text-3xl">😕</span>
                </div>
                <p className="text-destructive font-bold text-lg">Queue not found</p>
                <p className="text-muted-foreground text-sm">Check the code and try again</p>
                <Button variant="outline" onClick={() => navigate('/')}>Go Back</Button>
              </motion.div>
            )}

            {/* Join Form */}
            {queue && !userId && !loading && (
              <motion.div
                key="join"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="queue-card"
              >
                <JoinQueueForm
                  queueId={queue.id}
                  queueName={queue.name}
                  isPaused={queue.is_paused}
                  currentCount={users.length}
                  maxCapacity={queue.max_capacity}
                  onJoined={handleJoined}
                />
              </motion.div>
            )}

            {/* Position Display */}
            {queue && userId && userEntry && (
              <motion.div
                key="position"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <QueuePosition
                  position={userPosition}
                  avgServiceTime={queue.avg_service_time}
                  totalInQueue={users.length}
                />

                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{queue.name}</p>
                  {queue.is_paused && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="inline-block bg-warning/10 text-warning px-4 py-1.5 rounded-full text-xs font-bold"
                    >
                      Queue paused
                    </motion.div>
                  )}
                </div>

                <div className="text-center">
                  <Button variant="ghost" size="sm" onClick={handleLeave} className="text-muted-foreground hover:text-destructive">
                    Leave Queue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Served State */}
            {queue && userId && !userEntry && !loading && (
              <motion.div
                key="served"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-center space-y-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-24 h-24 gradient-bg rounded-full mx-auto flex items-center justify-center shadow-glow"
                >
                  <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-black text-foreground">You're Up!</h2>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default JoinQueue;

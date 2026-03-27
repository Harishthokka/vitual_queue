import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Queue, QueueUser } from '@/hooks/useQueue';
import { Play, Pause, UserCheck, Users, SkipForward, Clock } from 'lucide-react';

interface AdminControlsProps {
  queue: Queue;
  users: QueueUser[];
}

export function AdminControls({ queue, users }: AdminControlsProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const waitingUsers = users.filter(u => u.status === 'waiting');
  const nextUser = waitingUsers[0];

  const recalculatePositions = async (excludeUserId: string) => {
    const remainingUsers = waitingUsers.filter(u => u.id !== excludeUserId);
    for (let i = 0; i < remainingUsers.length; i++) {
      await supabase
        .from('queue_users')
        .update({ position: i + 1 })
        .eq('id', remainingUsers[i].id);
    }
  };

  const handleServeNext = async () => {
    if (!nextUser) { toast({ title: 'No one in queue' }); return; }
    setLoading(true);
    try {
      const { error: userError } = await supabase
        .from('queue_users')
        .update({ status: 'served', served_at: new Date().toISOString() })
        .eq('id', nextUser.id);
      if (userError) throw userError;
      await recalculatePositions(nextUser.id);
      const { error: queueError } = await supabase
        .from('queues')
        .update({ current_serving: queue.current_serving + 1 })
        .eq('id', queue.id);
      if (queueError) throw queueError;
      toast({ title: `Called ${nextUser.name || `#${nextUser.position}`}` });
    } catch (err: any) {
      toast({ title: 'Failed to serve next', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleSkip = async () => {
    if (!nextUser) { toast({ title: 'No one to skip' }); return; }
    setLoading(true);
    try {
      const { error: userError } = await supabase
        .from('queue_users')
        .update({ status: 'skipped' })
        .eq('id', nextUser.id);
      if (userError) throw userError;
      await recalculatePositions(nextUser.id);
      toast({ title: `Skipped ${nextUser.name || `#${nextUser.position}`}` });
    } catch (err: any) {
      toast({ title: 'Failed to skip', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleTogglePause = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('queues')
        .update({ is_paused: !queue.is_paused })
        .eq('id', queue.id);
      if (error) throw error;
      toast({ title: queue.is_paused ? 'Queue resumed' : 'Queue paused' });
    } catch (err: any) {
      toast({ title: 'Failed to update queue', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: 'Waiting', value: waitingUsers.length, color: 'text-primary' },
          { icon: UserCheck, label: 'Served', value: queue.current_serving, color: 'text-success' },
          { icon: Clock, label: 'Capacity', value: `${waitingUsers.length}/${queue.max_capacity}`, color: 'text-accent' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2, scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="stat-card"
          >
            <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
            <p className="text-2xl font-black text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Next person preview */}
      <AnimatePresence mode="wait">
        {nextUser && (
          <motion.div
            key={nextUser.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="queue-card text-center animate-pulse-glow"
          >
            <p className="text-muted-foreground text-sm mb-2 font-medium">Next up</p>
            <p className="text-5xl font-black gradient-text">#{nextUser.position}</p>
            {nextUser.name && (
              <p className="text-lg text-foreground mt-1 font-semibold">{nextUser.name}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleServeNext}
            disabled={loading || !nextUser}
            variant="success"
            size="xl"
            className="w-full"
          >
            <UserCheck className="w-5 h-5" />
            Serve Next
          </Button>
          <Button 
            onClick={handleSkip}
            disabled={loading || !nextUser}
            variant="outline"
            size="xl"
            className="w-full"
          >
            <SkipForward className="w-5 h-5" />
            Skip
          </Button>
        </div>

        <Button 
          onClick={handleTogglePause}
          disabled={loading}
          variant={queue.is_paused ? 'accent' : 'outline'}
          size="lg"
          className="w-full"
        >
          {queue.is_paused ? (
            <><Play className="w-5 h-5" /> Resume Queue</>
          ) : (
            <><Pause className="w-5 h-5" /> Pause Queue</>
          )}
        </Button>
      </div>

      {/* Queue list */}
      {waitingUsers.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Queue List</p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence>
              {waitingUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    index === 0 
                      ? 'border-primary/30 shadow-soft' 
                      : 'border-border/30 bg-card'
                  }`}
                  style={index === 0 ? { background: 'var(--gradient-glass)' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-lg font-mono ${index === 0 ? 'gradient-text' : 'text-primary'}`}>
                      #{user.position}
                    </span>
                    <span className="text-foreground font-medium">{user.name || 'Anonymous'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(user.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

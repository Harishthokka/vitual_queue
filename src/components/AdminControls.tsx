import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Queue, QueueUser } from '@/hooks/useQueue';
import { Play, Pause, UserCheck, Users } from 'lucide-react';

interface AdminControlsProps {
  queue: Queue;
  users: QueueUser[];
}

/**
 * Admin controls for managing the queue
 * - Serve Next: Mark next person as served
 * - Pause/Resume: Toggle queue accepting new entries
 */
export function AdminControls({ queue, users }: AdminControlsProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const waitingUsers = users.filter(u => u.status === 'waiting');
  const nextUser = waitingUsers[0];

  // Serve the next person in queue
  const handleServeNext = async () => {
    if (!nextUser) {
      toast({ title: 'No one in queue' });
      return;
    }

    setLoading(true);
    try {
      // Mark current user as served
      const { error: userError } = await supabase
        .from('queue_users')
        .update({ status: 'served', served_at: new Date().toISOString() })
        .eq('id', nextUser.id);

      if (userError) throw userError;

      // Update queue's current_serving counter
      const { error: queueError } = await supabase
        .from('queues')
        .update({ current_serving: queue.current_serving + 1 })
        .eq('id', queue.id);

      if (queueError) throw queueError;

      toast({ title: `Called ${nextUser.name || `#${nextUser.position}`}` });
    } catch (err: any) {
      toast({ title: 'Failed to serve next', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle pause state
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="queue-card py-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Waiting</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{waitingUsers.length}</p>
        </div>
        <div className="queue-card py-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-sm">Served</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{queue.current_serving}</p>
        </div>
        <div className="queue-card py-4">
          <p className="text-muted-foreground text-sm mb-1">Capacity</p>
          <p className="text-3xl font-bold text-foreground">
            {waitingUsers.length}/{queue.max_capacity}
          </p>
        </div>
      </div>

      {/* Next person preview */}
      {nextUser && (
        <div className="queue-card text-center">
          <p className="text-muted-foreground text-sm mb-2">Next up</p>
          <p className="text-4xl font-bold text-primary">#{nextUser.position}</p>
          {nextUser.name && (
            <p className="text-lg text-foreground mt-1">{nextUser.name}</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
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
          onClick={handleTogglePause}
          disabled={loading}
          variant={queue.is_paused ? 'default' : 'outline'}
          size="lg"
          className="w-full"
        >
          {queue.is_paused ? (
            <>
              <Play className="w-5 h-5" />
              Resume Queue
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" />
              Pause Queue
            </>
          )}
        </Button>
      </div>

      {/* Queue list */}
      {waitingUsers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Queue List</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {waitingUsers.map((user, index) => (
              <div 
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-primary">#{user.position}</span>
                  <span className="text-foreground">{user.name || 'Anonymous'}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

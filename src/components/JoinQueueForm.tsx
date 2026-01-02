import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JoinQueueFormProps {
  queueId: string;
  queueName: string;
  isPaused: boolean;
  currentCount: number;
  maxCapacity: number;
  onJoined: (userId: string, position: number) => void;
}

/**
 * Form for users to join a queue
 */
export function JoinQueueForm({ 
  queueId, 
  queueName, 
  isPaused, 
  currentCount, 
  maxCapacity,
  onJoined 
}: JoinQueueFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isFull = currentCount >= maxCapacity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPaused) {
      toast({ title: 'Queue is currently paused', variant: 'destructive' });
      return;
    }

    if (isFull) {
      toast({ title: 'Queue is at maximum capacity', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // Get current max position
      const { data: lastUser } = await supabase
        .from('queue_users')
        .select('position')
        .eq('queue_id', queueId)
        .eq('status', 'waiting')
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextPosition = (lastUser?.position || 0) + 1;

      const { data, error } = await supabase
        .from('queue_users')
        .insert({
          queue_id: queueId,
          position: nextPosition,
          name: name.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: `You're #${nextPosition} in line!` });
      onJoined(data.id, nextPosition);
    } catch (err: any) {
      toast({ title: 'Failed to join queue', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{queueName}</h2>
        <p className="text-muted-foreground">
          {currentCount} {currentCount === 1 ? 'person' : 'people'} in queue
        </p>
        {isPaused && (
          <div className="inline-block bg-warning/10 text-warning px-4 py-2 rounded-full text-sm font-medium">
            Queue is paused
          </div>
        )}
        {isFull && !isPaused && (
          <div className="inline-block bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium">
            Queue is full
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userName" className="text-base font-medium">Your Name (optional)</Label>
          <Input
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="h-12 text-base"
            disabled={isPaused || isFull}
          />
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full" 
          disabled={loading || isPaused || isFull}
        >
          {loading ? 'Joining...' : 'Join Queue'}
        </Button>
      </form>
    </div>
  );
}

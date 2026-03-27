import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Users } from 'lucide-react';

interface JoinQueueFormProps {
  queueId: string;
  queueName: string;
  isPaused: boolean;
  currentCount: number;
  maxCapacity: number;
  onJoined: (userId: string, position: number) => void;
}

export const JoinQueueForm = forwardRef<HTMLDivElement, JoinQueueFormProps>(({
  queueId, queueName, isPaused, currentCount, maxCapacity, onJoined
}, ref) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isFull = currentCount >= maxCapacity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaused) { toast({ title: 'Queue is currently paused', variant: 'destructive' }); return; }
    if (isFull) { toast({ title: 'Queue is at maximum capacity', variant: 'destructive' }); return; }
    setLoading(true);
    try {
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
        .insert({ queue_id: queueId, position: nextPosition, name: name.trim() || null })
        .select()
        .single();
      if (error) throw error;
      toast({ title: `You're #${nextPosition} in line!` });
      onJoined(data.id, nextPosition);
    } catch (err: any) {
      toast({ title: 'Failed to join queue', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div ref={ref} className="space-y-6">
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-14 h-14 gradient-bg rounded-2xl mx-auto flex items-center justify-center shadow-glow"
        >
          <Users className="w-7 h-7 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-black text-foreground">{queueName}</h2>
        <p className="text-muted-foreground">
          <span className="font-bold text-foreground">{currentCount}</span> {currentCount === 1 ? 'person' : 'people'} in queue
        </p>
        {isPaused && (
          <div className="inline-block bg-warning/10 text-warning px-4 py-2 rounded-full text-sm font-bold">
            Queue is paused
          </div>
        )}
        {isFull && !isPaused && (
          <div className="inline-block bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-bold">
            Queue is full
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userName" className="text-base font-semibold">Your Name (optional)</Label>
          <Input
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="h-13 text-base bg-secondary/50 border-border/50 focus:border-primary/50"
            disabled={isPaused || isFull}
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          className="w-full group" 
          disabled={loading || isPaused || isFull}
        >
          {loading ? 'Joining...' : 'Join Queue'}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>
    </div>
  );
});

JoinQueueForm.displayName = 'JoinQueueForm';

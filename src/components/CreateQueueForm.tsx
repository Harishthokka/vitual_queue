import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { generateQueueCode } from '@/lib/queue-utils';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

interface CreateQueueFormProps {
  onQueueCreated: (queueId: string, code: string) => void;
}

export function CreateQueueForm({ onQueueCreated }: CreateQueueFormProps) {
  const [name, setName] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(50);
  const [avgServiceTime, setAvgServiceTime] = useState(5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Please enter a queue name', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const code = generateQueueCode();
    try {
      const { data, error } = await supabase
        .from('queues')
        .insert({ name: name.trim(), code, max_capacity: maxCapacity, avg_service_time: avgServiceTime })
        .select()
        .single();
      if (error) throw error;
      toast({ title: 'Queue created successfully!' });
      onQueueCreated(data.id, data.code);
    } catch (err: any) {
      toast({ title: 'Failed to create queue', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="name" className="text-base font-semibold">Queue Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Coffee Shop, Clinic Reception"
          className="h-13 text-base bg-secondary/50 border-border/50 focus:border-primary/50"
          autoFocus
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-base font-semibold">Max Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 50)}
            min={1}
            max={500}
            className="h-13 text-base bg-secondary/50 border-border/50 focus:border-primary/50"
          />
          <p className="text-xs text-muted-foreground">Pauses when full</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceTime" className="text-base font-semibold">Avg. Time (min)</Label>
          <Input
            id="serviceTime"
            type="number"
            value={avgServiceTime}
            onChange={(e) => setAvgServiceTime(parseInt(e.target.value) || 5)}
            min={1}
            max={120}
            className="h-13 text-base bg-secondary/50 border-border/50 focus:border-primary/50"
          />
          <p className="text-xs text-muted-foreground">Per customer</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button type="submit" size="lg" className="w-full group" disabled={loading}>
          <Sparkles className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Queue'}
        </Button>
      </motion.div>
    </form>
  );
}

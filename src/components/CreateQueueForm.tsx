import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { generateQueueCode } from '@/lib/queue-utils';
import { useToast } from '@/hooks/use-toast';

interface CreateQueueFormProps {
  onQueueCreated: (queueId: string, code: string) => void;
}

/**
 * Form for admins to create a new queue
 */
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
        .insert({
          name: name.trim(),
          code,
          max_capacity: maxCapacity,
          avg_service_time: avgServiceTime,
        })
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
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-medium">Queue Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Coffee Shop, Clinic Reception"
          className="h-12 text-base"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-base font-medium">Max Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 50)}
            min={1}
            max={500}
            className="h-12 text-base"
          />
          <p className="text-xs text-muted-foreground">Queue pauses when full</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceTime" className="text-base font-medium">Avg. Time (min)</Label>
          <Input
            id="serviceTime"
            type="number"
            value={avgServiceTime}
            onChange={(e) => setAvgServiceTime(parseInt(e.target.value) || 5)}
            min={1}
            max={120}
            className="h-12 text-base"
          />
          <p className="text-xs text-muted-foreground">Per customer</p>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create Queue'}
      </Button>
    </form>
  );
}

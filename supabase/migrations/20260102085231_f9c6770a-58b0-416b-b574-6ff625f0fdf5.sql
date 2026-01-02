-- Create queues table
CREATE TABLE public.queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  max_capacity INTEGER NOT NULL DEFAULT 50,
  avg_service_time INTEGER NOT NULL DEFAULT 5, -- in minutes
  is_paused BOOLEAN NOT NULL DEFAULT false,
  current_serving INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create queue_users table (people in queue)
CREATE TABLE public.queue_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES public.queues(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'serving', 'served', 'left')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  served_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read queues (public queue info)
CREATE POLICY "Anyone can view queues" ON public.queues
FOR SELECT USING (true);

-- Allow anyone to create queues (admin creates)
CREATE POLICY "Anyone can create queues" ON public.queues
FOR INSERT WITH CHECK (true);

-- Allow anyone to update queues (for serve next functionality)
CREATE POLICY "Anyone can update queues" ON public.queues
FOR UPDATE USING (true);

-- Allow anyone to view queue_users
CREATE POLICY "Anyone can view queue_users" ON public.queue_users
FOR SELECT USING (true);

-- Allow anyone to join queue
CREATE POLICY "Anyone can join queue" ON public.queue_users
FOR INSERT WITH CHECK (true);

-- Allow anyone to update queue_users (for status changes)
CREATE POLICY "Anyone can update queue_users" ON public.queue_users
FOR UPDATE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.queues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_users;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for queues
CREATE TRIGGER update_queues_updated_at
BEFORE UPDATE ON public.queues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
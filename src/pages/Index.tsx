import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Zap, Clock } from 'lucide-react';

/**
 * Home page - Entry point to QueueLess
 * Users can either join an existing queue or create a new one (admin)
 */
const Index = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleJoinQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/join/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-10 animate-fade-in">
          {/* Logo & Headline */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-2">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Queue<span className="text-primary">Less</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xs mx-auto">
              Skip the physical line. Join queues virtually.
            </p>
          </div>

          {/* Join Queue Form */}
          <div className="queue-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground text-center">Join a Queue</h2>
            <form onSubmit={handleJoinQueue} className="space-y-4">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter queue code"
                className="h-14 text-center text-xl tracking-widest font-medium uppercase"
                maxLength={6}
              />
              <Button type="submit" size="lg" className="w-full" disabled={!code.trim()}>
                Join Queue
              </Button>
            </form>
          </div>

          {/* Admin Option */}
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-3">Running a business?</p>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/admin')}
              className="w-full"
            >
              Create a Queue
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Instant Join</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Live ETA</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Real-time</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Made for hackathons 🚀</p>
      </footer>
    </div>
  );
};

export default Index;

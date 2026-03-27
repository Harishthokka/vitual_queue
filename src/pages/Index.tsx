import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Zap, Clock, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen hero-gradient flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob blob-primary w-96 h-96 -top-48 -right-24 animate-float" />
      <div className="blob blob-accent w-72 h-72 bottom-24 -left-20 animate-float-delayed" />
      <div className="blob blob-primary w-56 h-56 top-1/2 right-1/4 animate-float-delayed" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md space-y-10">
          {/* Logo & Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 gradient-bg rounded-3xl shadow-glow"
            >
              <Users className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-5xl font-black tracking-tight text-foreground">
              Queue<span className="gradient-text">Less</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Skip the physical line. Join queues <span className="gradient-accent-text font-semibold">virtually</span>.
            </p>
          </motion.div>

          {/* Join Queue Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="queue-card space-y-5"
          >
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-foreground">Join a Queue</h2>
            </div>
            <form onSubmit={handleJoinQueue} className="space-y-4">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter queue code"
                className="h-14 text-center text-xl tracking-[0.3em] font-mono font-semibold uppercase bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                maxLength={6}
              />
              <Button type="submit" size="lg" className="w-full group" disabled={!code.trim()}>
                Join Queue
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </motion.div>

          {/* Admin Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="text-center space-y-3"
          >
            <p className="text-muted-foreground text-sm">Running a business?</p>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/admin')}
              className="w-full group"
            >
              Create a Queue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-2"
          >
            {[
              { icon: Zap, label: 'Instant Join', color: 'text-accent' },
              { icon: Clock, label: 'Live ETA', color: 'text-primary' },
              { icon: Users, label: 'Real-time', color: 'text-success' },
            ].map((feat, i) => (
              <motion.div
                key={feat.label}
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="stat-card cursor-default"
              >
                <feat.icon className={`w-6 h-6 ${feat.color} mx-auto mb-2`} />
                <p className="text-xs font-medium text-muted-foreground">{feat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground relative z-10">
        <p>Made for hackathons 🚀</p>
      </footer>
    </div>
  );
};

export default Index;

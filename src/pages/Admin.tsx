import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CreateQueueForm } from '@/components/CreateQueueForm';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { AdminControls } from '@/components/AdminControls';
import { useQueue } from '@/hooks/useQueue';
import { ArrowLeft, Share2, Copy, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const [queueId, setQueueId] = useState<string | null>(null);
  const [queueCode, setQueueCode] = useState<string | null>(null);
  const { queue, users, loading } = useQueue(queueId);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleQueueCreated = (id: string, code: string) => {
    setQueueId(id);
    setQueueCode(code);
  };

  const handleCopyCode = () => {
    if (queueCode) {
      navigator.clipboard.writeText(queueCode);
      toast({ title: 'Code copied!' });
    }
  };

  const handleShare = async () => {
    if (!queueCode) return;
    const shareData = {
      title: 'Join Queue - QueueLess',
      text: `Join the queue with code: ${queueCode}`,
      url: `${window.location.origin}/join/${queueCode}`,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { handleCopyCode(); }
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="min-h-screen hero-gradient relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob blob-primary w-80 h-80 -top-40 -right-20 animate-float" />
      <div className="blob blob-accent w-64 h-64 bottom-20 -left-16 animate-float-delayed" />

      {/* Header */}
      <header className="sticky top-0 bg-background/60 backdrop-blur-xl border-b border-border/30 z-20">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h1 className="font-bold text-foreground">Admin</h1>
          </div>
          {queueCode ? (
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          ) : <div className="w-16" />}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* Create Queue State */}
          {!queueId && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-foreground">Create a Queue</h2>
                <p className="text-muted-foreground">Set up your virtual queue in seconds</p>
              </div>
              <div className="queue-card">
                <CreateQueueForm onQueueCreated={handleQueueCreated} />
              </div>
            </motion.div>
          )}

          {/* Queue Management State */}
          {queueId && queue && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Queue Code Display */}
              <motion.div 
                className="queue-card text-center animate-pulse-glow"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <p className="text-muted-foreground text-sm mb-2">Queue Code</p>
                <button 
                  onClick={handleCopyCode}
                  className="group flex items-center justify-center gap-3 mx-auto"
                >
                  <span className="text-4xl font-black font-mono tracking-[0.3em] gradient-text">
                    {queueCode}
                  </span>
                  <Copy className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
                <p className="text-xs text-muted-foreground mt-2">{queue.name}</p>
              </motion.div>

              {/* QR Code */}
              <details className="queue-card group">
                <summary className="cursor-pointer text-center font-semibold text-muted-foreground hover:text-primary transition-colors">
                  Show QR Code
                </summary>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4"
                >
                  <QRCodeDisplay code={queueCode!} queueName={queue.name} />
                </motion.div>
              </details>

              {/* Admin Controls */}
              <AdminControls queue={queue} users={users} />
            </motion.div>
          )}
        </AnimatePresence>

        {loading && queueId && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full mx-auto"
            />
            <p className="text-muted-foreground mt-4">Loading queue...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;

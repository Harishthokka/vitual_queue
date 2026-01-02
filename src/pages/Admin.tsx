import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreateQueueForm } from '@/components/CreateQueueForm';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { AdminControls } from '@/components/AdminControls';
import { useQueue } from '@/hooks/useQueue';
import { ArrowLeft, Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Admin page - Create and manage queues
 */
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
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border/50 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <h1 className="font-semibold text-foreground">Admin</h1>
          {queueCode && (
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          {!queueCode && <div className="w-16" />}
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {/* Create Queue State */}
        {!queueId && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Create a Queue</h2>
              <p className="text-muted-foreground">Set up your virtual queue in seconds</p>
            </div>
            <div className="queue-card">
              <CreateQueueForm onQueueCreated={handleQueueCreated} />
            </div>
          </div>
        )}

        {/* Queue Management State */}
        {queueId && queue && (
          <div className="space-y-6 animate-fade-in">
            {/* Queue Code Display */}
            <div className="queue-card text-center">
              <p className="text-muted-foreground text-sm mb-2">Queue Code</p>
              <button 
                onClick={handleCopyCode}
                className="group flex items-center justify-center gap-2 mx-auto"
              >
                <span className="text-4xl font-bold tracking-widest text-primary">
                  {queueCode}
                </span>
                <Copy className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <p className="text-xs text-muted-foreground mt-2">{queue.name}</p>
            </div>

            {/* QR Code (collapsible) */}
            <details className="queue-card">
              <summary className="cursor-pointer text-center font-medium text-muted-foreground hover:text-foreground transition-colors">
                Show QR Code
              </summary>
              <div className="pt-4">
                <QRCodeDisplay code={queueCode!} queueName={queue.name} />
              </div>
            </details>

            {/* Admin Controls */}
            <AdminControls queue={queue} users={users} />
          </div>
        )}

        {loading && queueId && (
          <div className="text-center py-12 text-muted-foreground">
            Loading queue...
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;

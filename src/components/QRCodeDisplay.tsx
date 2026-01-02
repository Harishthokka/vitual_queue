import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  code: string;
  queueName: string;
}

/**
 * QR Code component for sharing queue
 */
export function QRCodeDisplay({ code, queueName }: QRCodeDisplayProps) {
  const joinUrl = `${window.location.origin}/join/${code}`;
  
  return (
    <div className="queue-card text-center space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{queueName}</h3>
      
      {/* QR Code */}
      <div className="bg-background p-4 rounded-xl inline-block">
        <QRCodeSVG 
          value={joinUrl} 
          size={180}
          level="M"
          includeMargin={false}
        />
      </div>
      
      {/* Code display */}
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">Queue code</p>
        <p className="text-3xl font-bold tracking-widest text-primary">{code}</p>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Scan QR or enter code at {window.location.host}
      </p>
    </div>
  );
}

import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

interface QRCodeDisplayProps {
  code: string;
  queueName: string;
}

export function QRCodeDisplay({ code, queueName }: QRCodeDisplayProps) {
  const joinUrl = `${window.location.origin}/join/${code}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <h3 className="text-lg font-bold text-foreground">{queueName}</h3>
      <div className="bg-white p-5 rounded-2xl inline-block shadow-soft">
        <QRCodeSVG 
          value={joinUrl} 
          size={180}
          level="M"
          includeMargin={false}
          fgColor="#6C3AED"
        />
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">Queue code</p>
        <p className="text-3xl font-black font-mono tracking-[0.3em] gradient-text">{code}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Scan QR or enter code at {window.location.host}
      </p>
    </motion.div>
  );
}

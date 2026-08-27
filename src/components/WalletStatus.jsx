import React from 'react';
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

export const formatAddress = (addr) => {
  if (!addr) return '';
  if (addr.length <= 10) return addr;
  return `${addr.substring(0, 5)}...${addr.substring(addr.length - 3)}`;
};

const WalletStatus = ({
  isConnected = false,
  address = null,
  showAddress = true,
  className = ''
}) => {
  return (
    <div className={`wallet-status-pill ${isConnected ? 'connected' : 'disconnected'} ${className}`}>
      <span className={`status-dot-circle ${isConnected ? 'connected' : 'disconnected'}`} />
      
      {isConnected ? (
        <>
          <CheckCircle2 size={15} />
          <span>Wallet Connected</span>
          {showAddress && address && (
            <span style={{ opacity: 0.85, fontWeight: 700, fontFamily: 'monospace' }}>
              ({formatAddress(address)})
            </span>
          )}
        </>
      ) : (
        <>
          <AlertCircle size={15} />
          <span>Wallet Not Connected</span>
        </>
      )}
    </div>
  );
};

export default WalletStatus;

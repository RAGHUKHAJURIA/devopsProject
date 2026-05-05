'use client'
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import SolanaComponent from '@/components/SolanaComponent';

export default function SolanaPayment() {
  return (
    <ConnectionProvider endpoint='https://api.devnet.solana.com/'>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
        <SolanaComponent ></SolanaComponent>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
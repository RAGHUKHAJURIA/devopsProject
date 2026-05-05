'use client'
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import FeaturePaymentComponent from '@/components/FeaturePayment';
export default function SolanaPayment() {
  return (
    <ConnectionProvider endpoint='https://api.devnet.solana.com/'>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
        <FeaturePaymentComponent ></FeaturePaymentComponent>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
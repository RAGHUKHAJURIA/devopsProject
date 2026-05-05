'use client'
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowRight, DollarSign, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

// Type for the project details
interface ProjectDetails {
  id: number;
  title: string;
  description: string;
  budget: number;
  timeExpected: string;
  experienceReq: string;
  skillsRequired: string[];
}

const FeaturePaymentComponent: React.FC = () => {
  const wallet = useWallet();
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [transactionComplete, setTransactionComplete] = useState<boolean>(false);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const escrowId = "6mxD8MFakTGewgamvnA9MfC4fNBiZavwfbCCzccgwKYm"; // Escrow public key
  const connection = new Connection("https://api.devnet.solana.com/", "confirmed");
  const { id } = useParams();
  const router = useRouter(); // Initialize router for navigation
  const searchParams = useSearchParams();
  const applicantId = searchParams.get('applicantId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const projectResponse = await axios.get(`/api/projects/${id}/info`);
      
        setProjectDetails(projectResponse.data.project);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, applicantId]);


  const handleSendMoney = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (projectDetails) {
      const fixedAmount = 0.03

      setIsAnimating(true);
      try {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(escrowId),
            lamports: Math.round(fixedAmount * LAMPORTS_PER_SOL),
          })
        );

        transaction.feePayer = wallet.publicKey;
        const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'processed');
        setTransactionComplete(true);
        await axios.put(`/api/projects/${id}/feature`)
        router.push('/dashboard')

      } catch (error) {
        console.error('Transaction failed', error);
        alert('Transaction failed. Please try again.');
      } finally {
        setIsAnimating(false);
      }
    }
  };

  const renderTransferDetails = () => {
    if (projectDetails) {
      const fixedAmount = 0.03;

      return (
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-1">
            Amount being transferred (Includes 5% platform fee): <span className="font-bold text-amber-400">{fixedAmount.toFixed(6)} SOL</span>
          </p>
        </div>
      );
    }
    return null;
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="flex justify-center w-full mb-4">
        <WalletMultiButton />
      </div>
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-400">Secure Payment</h2>

        {transactionComplete && (
          <motion.div
            className="mt-4 flex flex-col items-center justify-center text-green-400 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CheckCircle size={20} className="mr-2" />
            <div>
              Redirecting....
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 text-white p-4 rounded-full mb-3 shadow-lg">
              <DollarSign size={28} />
            </div>
            <p className="text-sm font-semibold">Your Wallet</p>
            <p className="text-xs text-gray-400 mt-1">
              {wallet.publicKey
                ? `${wallet.publicKey.toBase58().slice(0, 8)}...${wallet.publicKey.toBase58().slice(-8)}`
                : 'Not Connected'}
            </p>
          </div>

          <motion.div
            animate={isAnimating ? { x: [0, 20, 0], opacity: [1, 0, 1] } : {}}
            transition={{ duration: 1, repeat: 2 }}
          >
            <ArrowRight size={28} className="text-blue-400" />
          </motion.div>

          <div className="flex flex-col items-center">
            <div className="bg-yellow-600 text-white p-4 rounded-full mb-3 shadow-lg">
              <Lock size={28} />
            </div>
            <p className="text-sm font-semibold">DecentraWork</p>
            <p className="text-xs text-gray-400 mt-1">{`${escrowId.slice(0, 8)}...${escrowId.slice(-8)}`}</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">
            Funds will be sent to the official DecentraWork Account. This transaction will grant the particular project featured status for 7 days
          </p>
        </div>

        {renderTransferDetails()}

        <motion.button
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition duration-300 ease-in-out"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMoney}
          disabled={isAnimating || !wallet.connected || transactionComplete}
        >
          {wallet.connected
            ? transactionComplete
              ? 'Project Featured'
              : 'Transfer Funds to Feature'
            : 'Connect Wallet to Transfer Funds'}
        </motion.button>

        {isAnimating && (
          <motion.div
            className="mt-4 text-center text-yellow-400 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            Transaction in progress...
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FeaturePaymentComponent;
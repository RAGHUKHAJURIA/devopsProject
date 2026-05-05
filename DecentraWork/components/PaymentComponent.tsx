'use client'
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { FaBriefcase, FaClock, FaDollarSign, FaTools, FaUser, FaEnvelope, FaStar } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectDetails {
  id: number;
  title: string;
  description: string;
  budget: number;
  timeExpected: string;
  experienceReq: string;
  skillsRequired: string[];
}

interface FreelancerDetails {
  id: number;
  name: string;
  email: string;
  experience: string;
  skills: string[];
  bio: string;
}

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-4/6 mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-3/6 mb-2"></div>
  </div>
);

const PaymentPage = () => {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [freelancerDetails, setFreelancerDetails] = useState<FreelancerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const applicantId = searchParams.get('applicantId');

  const handleSolana = () => {
    router.push(`/projects/${id}/payments/solana?applicantId=${applicantId}`);
  };

  const fetchProjectDetails = async () => {
    try {
      const session = await getSession();
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      const response = await axios.get(`/api/projects/${id}/info`);

      setProjectDetails(response.data.project);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const fetchFreelancerDetails = async () => {
    try {
      if (!applicantId) return;
      const response = await axios.get(`/api/user/account/${applicantId}`);
      setFreelancerDetails(response.data);
    } catch (error) {
      console.error('Error fetching freelancer details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchFreelancerDetails();
    }
  }, [id, applicantId]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-5xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          {...fadeInUp}
        >
          Payment Options
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {loading ? (
              <motion.div key="skeleton" {...fadeInUp}>
                <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
                  <CardContent className="pt-6">
                    <SkeletonLoader />
                  </CardContent>
                </Card>
              </motion.div>
            ) : projectDetails && (
              <motion.div key="details" {...fadeInUp}>
                <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 mb-8 transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center text-3xl font-semibold text-gray-200">
                      <FaBriefcase className="mr-3 text-yellow-400" /> Project Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-4">{projectDetails.title}</h2>
                    <motion.p className="mb-3 flex items-center text-gray-400" {...fadeInUp}>
                      <FaDollarSign className="mr-3 text-green-400" /> Budget: 
                      <span className="ml-2 text-green-300 font-semibold">${projectDetails.budget}</span>
                    </motion.p>
                    <motion.p className="mb-3 flex items-center text-gray-400" {...fadeInUp}>
                      <FaClock className="mr-3 text-blue-400" /> Time Expected: 
                      <span className="ml-2 text-blue-300 font-semibold">{projectDetails.timeExpected}</span>
                    </motion.p>
                    <motion.p className="mb-3 flex items-center text-gray-400" {...fadeInUp}>
                      <FaBriefcase className="mr-3 text-yellow-400" /> Experience Required: 
                      <span className="ml-2 text-yellow-300 font-semibold">{projectDetails.experienceReq}</span>
                    </motion.p>
                    <motion.p className="mb-3 flex items-center text-gray-400" {...fadeInUp}>
                      <FaTools className="mr-3 text-red-400" /> Skills Required: 
                      <span className="ml-2 text-red-300 font-semibold">{projectDetails.skillsRequired.join(', ')}</span>
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {loading ? (
              <motion.div key="freelancer-skeleton" {...fadeInUp}>
                <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
                  <CardContent className="pt-6">
                    <SkeletonLoader />
                  </CardContent>
                </Card>
              </motion.div>
            ) : freelancerDetails && (
              <motion.div key="freelancer-details" {...fadeInUp}>
                <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 mb-8 transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center text-3xl font-semibold text-gray-200">
                      <FaUser className="mr-3 text-blue-400" /> Freelancer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-4">{freelancerDetails.name}</h2>
                    <motion.p className="mb-3 flex items-center text-gray-400" {...fadeInUp}>
                      <FaEnvelope className="mr-3 text-green-400" /> Email: 
                      <span className="ml-2 text-green-300 font-semibold">{freelancerDetails.email}</span>
                    </motion.p>
                    <motion.p className="mb-3 flex items-center text-gray-400" {...fadeInUp}>
                      <FaStar className="mr-3 text-yellow-400" /> Experience: 
                      <span className="ml-2 text-yellow-300 font-semibold">{freelancerDetails.experience}</span>
                    </motion.p>
                    <motion.p className="mb-3 flex items-center text-gray-400" {...fadeInUp}>
                      <FaTools className="mr-3 text-red-400" /> Skills: 
                      <span className="ml-2 text-red-300 font-semibold">{freelancerDetails.skills.join(', ')}</span>
                    </motion.p>
                    <motion.p className="mb-3 text-gray-400" {...fadeInUp}>
                      <strong className="text-purple-300">Bio:</strong> {freelancerDetails.bio}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div {...fadeInUp}>
          <Alert className="mb-8 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg shadow-md">
            <AlertTitle className="font-semibold text-lg">Platform Fees</AlertTitle>
            <AlertDescription className="text-sm">
              A 5% platform fee will be charged, and the money will be transferred to a safe bank account used as escrow.
            </AlertDescription>
          </Alert>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-1 gap-6"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleSolana} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center shadow-lg">
              <SiSolana className="mr-3" size={28} /> Pay with Solana
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
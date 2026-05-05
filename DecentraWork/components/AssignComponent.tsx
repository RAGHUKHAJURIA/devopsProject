
'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
interface freelancerProps{
  name:string
}
const AssignFreelancer: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantId = searchParams.get('applicantId');

  const [loading, setLoading] = useState(true);
  const [freelancer, setFreelancer] = useState<freelancerProps>(); // Adjust type as per your freelancer model
  const [error, setError] = useState<string | null>(null);
  const handleContact = async () =>{
    router.push(`/dashboard`)
  }
  useEffect(() => {
    const fetchFreelancerDetails = async () => {
      try {
        if (applicantId) {
          const response = await axios.get(`/api/user/account/assign?applicantId=${applicantId}`); // Adjust endpoint as needed
          setFreelancer(response.data);
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching freelancer details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerDetails();
  }, [applicantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
        <p className="text-lg">Assigning Freelancer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-red-500">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-4">
      <h2 className="text-3xl font-bold text-center mb-4 text-blue-400">
        Freelancer Assigned!!!
      </h2>
      {freelancer && (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <p className="text-lg text-center">
            {freelancer.name} has been successfully assigned to your project!
          </p>
          <button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold transition duration-300 ease-in-out"
            onClick={(handleContact)} // Adjust routing as needed
          >
            Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignFreelancer;

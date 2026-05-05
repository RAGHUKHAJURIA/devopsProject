'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from 'next/navigation'
import { Loader2, User, Calendar, Mail, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface Application {
  id: number
  coverLetter: string
  createdAt: string
  applicant: {
    id: number
    name: string
    email: string
  }
}

export default function ProposalComponent() {
  const [applications, setApplications] = useState<Application[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (id) {
      fetchApplications()
    }
  }, [id])

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get(`/api/projects/${id}/applications`)
      setApplications(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load applications.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChoose = (applicationId: number, applicantId: number) => {
    router.push(`/projects/${id}/payments?applicantId=${applicantId}`)
  }

  const handleViewProfile = (applicantId: number) => {
    router.push(`/user/${applicantId}/view`)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-b from-[#0a0b0d] to-[#1a1b1e] text-gray-100">
      <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
      <span className="ml-2 text-lg">Loading...</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-b from-[#0a0b0d] to-[#1a1b1e] text-gray-100">
      <div className="text-center text-red-500">{error}</div>
    </div>
  )

  if (applications.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-[#0a0b0d] to-[#1a1b1e] text-gray-100">
      <h2 className="text-2xl mb-4 text-indigo-400">No Applications Found</h2>
      <p className="text-lg text-gray-300 mb-4">It seems there are currently no applications for this project.</p>
      <p className="text-gray-400">Encourage potential applicants to apply!</p>
    </div>
  )

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gradient-to-b from-[#0a0b0d] to-[#1a1b1e] text-gray-100">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl mb-6 text-indigo-400 font-bold"
      >
        Project Applications
      </motion.h1>
      <div className="grid gap-6 w-full max-w-3xl">
        {applications.map((application, index) => (
          <motion.div
            key={application.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#2a2b2e] border border-indigo-500/30 shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 rounded-lg">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-400 flex items-center">
                  <User className="mr-2 h-5 w-5 text-indigo-500" />
                  {application.applicant.name}
                </CardTitle>
                <p className="text-sm text-gray-400 flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-gray-300 flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-indigo-500" />
                  <span className="font-semibold">{application.applicant.email}</span>
                </p>
                <p className="mb-2 text-gray-300 flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                  Cover Letter:
                </p>
                <p className="text-gray-200 bg-[#1a1b1e] p-4 rounded-md leading-relaxed">{application.coverLetter}</p>
                <div className="mt-4 flex space-x-4">
                  <Button 
                    onClick={() => handleChoose(application.id, application.applicant.id)} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200 px-4 py-2 rounded"
                  >
                    Choose
                  </Button>
                  <Button 
                    onClick={() => handleViewProfile(application.applicant.id)} 
                    variant="outline"
                    className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 transition duration-200 px-4 py-2 rounded"
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

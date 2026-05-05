'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle, DollarSign, Clock, Award, Code, ArrowLeft } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface Project {
  id: number
  title: string
  description: string
  budget: number
  timeExpected: string
  experienceReq: string
  skillsRequired: string[]
  client: {
    name: string
  }
}

export default function ApplyJobComponent() {
  const [project, setProject] = useState<Project | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const { id } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (id && status === 'authenticated') {
      fetchProjectData()
      checkApplicationStatus()
    }
  }, [id, status])

  const fetchProjectData = async () => {
    try {
      const { data } = await axios.get(`/api/projects/${id}/info`)
      setProject(data.project)
    } catch (err) {
      console.error(err);
      setError('Failed to load project data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewApplications = () => {
    router.push(`/user/${session?.user.id}/proposals`)
  }

  const checkApplicationStatus = async () => {
    try {
      const { data } = await axios.get(`/api/projects/${id}/check`)
    
      setHasApplied(data.applied)
    } catch (err) {
      console.error('Failed to check application status:', err)
      setError('Failed to check application status. Please try again later.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || status !== 'authenticated' || !session?.user) {
      setError('You must be logged in to apply.')
      return
    }

    try {
      const response = await axios.post(`/api/projects/${id}/apply`, {
        projectId: project.id,
        applicantId: session.user.id,
        coverLetter,
      })

      if (response.status === 200) {
        setSuccessMessage('Application submitted successfully!')
        setHasApplied(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        throw new Error('Failed to submit application')
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit application. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0b0d]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0b0d]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-200 flex items-center bg-red-600 p-4 rounded-lg shadow-lg"
        >
          <AlertCircle className="mr-2" />
          {error}
        </motion.div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0b0d]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-200 bg-[#1a1b1e] p-4 rounded-lg shadow-lg"
        >
          Project not found
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0a0b0d] text-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-indigo-400 hover:text-indigo-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <Card className="bg-[#1a1b1e] border-indigo-500/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
              <CardTitle className="text-3xl font-bold">{project.title}</CardTitle>
              <CardDescription className="text-indigo-200 text-lg">
                Posted by {project.client.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-6">
              <p className="mb-6 text-gray-300 text-lg leading-relaxed">{project.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center bg-[#2a2b2e] p-4 rounded-lg">
                  <DollarSign className="mr-3 text-indigo-400 w-6 h-6" />
                  <span className="text-lg"><strong>Budget:</strong> ${project.budget}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center bg-[#2a2b2e] p-4 rounded-lg">
                  <Clock className="mr-3 text-indigo-400 w-6 h-6" />
                  <span className="text-lg"><strong>Expected Time:</strong> {project.timeExpected}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center bg-[#2a2b2e] p-4 rounded-lg">
                  <Award className="mr-3 text-indigo-400 w-6 h-6" />
                  <span className="text-lg"><strong>Required Experience:</strong> {project.experienceReq}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center bg-[#2a2b2e] p-4 rounded-lg">
                  <Code className="mr-3 text-indigo-400 w-6 h-6" />
                  <span className="text-lg"><strong>Skills Required: <div>
                  {project.skillsRequired.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-none">
                    {skill}
                  </Badge>
                ))}
                    </div></strong></span>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-[#1a1b1e] border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-400">
                {hasApplied ? 'Application Status' : 'Apply for this Job'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasApplied ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-indigo-400 flex flex-col items-center justify-center p-6"
                >
                  <CheckCircle className="w-16 h-16 mb-4" />
                  <p className="text-xl font-semibold">You have already applied for this job!</p>
                  <Button
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-300 ease-in-out"
                    onClick={handleViewApplications}
                  >
                    View Your Applications
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <Label htmlFor="coverLetter" className="text-lg text-indigo-400 mb-2 block">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain why you're a great fit for this job..."
                      className="mt-1 bg-[#2a2b2e] text-gray-100 border-indigo-500/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg p-4"
                      rows={8}
                      required
                    />
                  </div>
                  <AnimatePresence>
                    {successMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 text-indigo-400 flex items-center justify-center text-lg"
                      >
                        <CheckCircle className="mr-2" />
                        {successMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-indigo-900 transition duration-300 ease-in-out font-semibold text-lg py-3 rounded-lg shadow-lg"
                    >
                      Submit Application
                    </Button>
                  </motion.div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
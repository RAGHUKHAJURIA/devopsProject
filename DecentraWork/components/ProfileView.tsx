'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, DollarSign, Calendar, User, Mail } from 'lucide-react'
import { useParams } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  experience: string | null
  skills: string[]
  bio: string | null
  walletAddressSOL: string,
  walletAddressETH: string
  projectsCreated: Project[]
}

interface Project {
  id: number
  title: string
  description: string
  budget: number
  timeExpected: string
  experienceReq: string
  skillsRequired: string[]
  client: {
    id: number
    name: string
    email: string
  }
}

export default function ProfileViewComponent() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { id } = useParams() as { id: string }

  useEffect(() => {
    if (id) {
      fetchUserProfileWithProjects(id)
    }
  }, [id])

  const fetchUserProfileWithProjects = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/user/account/${id}`)
      setUser(data)
    } catch (err) {
      console.error(err);
      setError('Failed to load user profile and projects.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-[#0a0b0d]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-indigo-400 text-2xl font-light"
      >
        Loading...
      </motion.div>
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center h-screen bg-[#0a0b0d]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-red-500 text-xl"
      >
        {error}
      </motion.div>
    </div>
  )

  if (!user) return (
    <div className="flex justify-center items-center h-screen bg-[#0a0b0d]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-indigo-400 text-xl"
      >
        User not found
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#1a1b1e] to-[#2a2b2e] text-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-[#1a1b1e] border-indigo-500/20 overflow-hidden shadow-lg">
          <CardHeader className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-75" />
            <div className="relative z-10 flex items-center space-x-4">
              <Avatar className="w-24 h-24 border-4 border-indigo-400">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt={user.name} />
                <AvatarFallback className="bg-indigo-700 text-gray-100">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-100">{user.name}</CardTitle>
                <p className="text-gray-200 opacity-80">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-6">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-[#2a2b2e]">
                <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-gray-100">Profile</TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-gray-100">Projects</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-indigo-400">Bio</Label>
                    <p className="text-gray-300">{user.bio || 'No bio available'}</p>
                  </div>
                  <div>
                    <Label className="text-indigo-400">Experience Level</Label>
                    <p className="text-gray-300">{user.experience || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-indigo-400">Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-none">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-indigo-400">Solana Wallet Address</Label>
                    <p className="text-gray-300">{user.walletAddressSOL || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-indigo-400">ETH Wallet Address</Label>
                    <p className="text-gray-300">{user.walletAddressETH || 'Not specified'}</p>
                  </div>
                </motion.div>
              </TabsContent>
              <TabsContent value="projects">
                <div className="space-y-4">
                  {user.projectsCreated.length > 0 ? (
                    user.projectsCreated.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="bg-[#2a2b2e] border-indigo-500/20">
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center text-indigo-400">
                              <Briefcase className="mr-2 h-5 w-5 text-indigo-500" />
                              {project.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 mb-4">{project.description}</p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center">
                                <DollarSign className="mr-2 h-5 w-5 text-indigo-500" />
                                <span className="text-gray-300">Budget: ${project.budget}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
                                <span className="text-gray-300">Time: {project.timeExpected}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="mr-2 h-5 w-5 text-indigo-500" />
                                <span className="text-gray-300">Experience: {project.experienceReq}</span>
                              </div>
                            </div>
                            <div className="mb-4">
                              <Label className="text-indigo-400">Required Skills</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {project.skillsRequired.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-none">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-indigo-400">Client</Label>
                              <div className="flex items-center mt-2">
                                <User className="mr-2 h-5 w-5 text-indigo-500" />
                                <span className="text-gray-300">{project.client.name}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="mr-2 h-5 w-5 text-indigo-500" />
                                <span className="text-gray-300">{project.client.email}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-300"
                    >
                      No projects found for this user.
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
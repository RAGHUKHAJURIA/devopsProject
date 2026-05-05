'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit2, Save, X, Briefcase, DollarSign, Calendar, User, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  experience: string | null
  skills: string[]
  bio: string | null
  walletAddressSOL: string
  walletAddressETH: string
  projectsCreated: Project[]
}

interface Project {
  id: number
  title: string
  description: string
  budget: number
  timeExpected: string | null
  experienceReq: string
  skillsRequired: string[]
  client: {
    id: number
    name: string
    email: string
  }
}

export default function Component() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<User | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile(session.user.id)
    }
  }, [session])

  const fetchUserProfile = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/user/account/${id}`)
      setUser(data)
      setEditedUser(data)
      setIsOwner(session?.user?.id === data.id.toString())
    } catch (err) {
      console.error(err)
      setError('Failed to load user profile.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    if (isOwner) {
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (isOwner) {
      try {
        await axios.put(`/api/user/account/${user?.id}`, editedUser)
        setUser(editedUser)
        setIsEditing(false)
      } catch (err) {
        console.error(err);
        setError('Failed to update user profile.')
      }
    }
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null)
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-blue-400 text-2xl font-light"
      >
        Loading...
      </motion.div>
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
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
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-blue-400 text-xl"
      >
        User not found
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm overflow-hidden shadow-xl">
          <CardHeader className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <Avatar className="w-24 h-24 border-4 border-blue-500/50">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt={user.name} />
                <AvatarFallback className="bg-blue-600 text-slate-100">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-100">{user.name}</CardTitle>
                <p className="text-slate-300 opacity-80">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-6">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500 data-[state=active]:text-slate-100">Profile</TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-blue-500 data-[state=active]:text-slate-100">Projects</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                {isEditing && isOwner ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="name" className="text-blue-400">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={editedUser?.name || ''}
                        onChange={handleChange}
                        className="bg-slate-700/50 border-blue-500/50 text-slate-200 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-blue-400">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={5}
                        value={editedUser?.bio || ''}
                        onChange={handleChange}
                        className="bg-slate-700/50 border-blue-500/50 text-slate-200 focus:border-blue-400"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="experience" className="text-blue-400">Experience Level</Label>
                        <Input
                          id="experience"
                          name="experience"
                          value={editedUser?.experience || ''}
                          onChange={handleChange}
                          className="bg-slate-700/50 border-blue-500/50 text-slate-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="skills" className="text-blue-400">Skills (comma-separated)</Label>
                        <Input
                          id="skills"
                          name="skills"
                          value={editedUser?.skills?.join(', ') || ''}
                          onChange={(e) => setEditedUser(prev => prev ? { ...prev, skills: e.target.value.split(',').map(skill => skill.trim()) } : null)}
                          className="bg-slate-700/50 border-blue-500/50 text-slate-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="SOLAddress" className="text-blue-400">Solana Wallet Address</Label>
                        <Input
                          id="SOLAddress"
                          name="walletAddressSOL"
                          value={editedUser?.walletAddressSOL || ''}
                          onChange={handleChange}
                          className="bg-slate-700/50 border-blue-500/50 text-slate-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ETHAddress" className="text-blue-400">Ethereum Wallet Address</Label>
                        <Input
                          id="ETHAddress"
                          name="walletAddressETH"
                          value={editedUser?.walletAddressETH || ''}
                          onChange={handleChange}
                          className="bg-slate-700/50 border-blue-500/50 text-slate-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-slate-100">
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                      <Button onClick={handleCancel} variant="destructive" className="bg-red-500/10 hover:bg-red-500/20 text-red-500">
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <Label className="text-blue-400 block mb-2">Bio</Label>
                      <p className="text-slate-300 break-words">{user.bio || 'No bio available'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <Label className="text-blue-400 block mb-2">Experience Level</Label>
                        <p className="text-slate-300">{user.experience || 'Not specified'}</p>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <Label className="text-blue-400 block mb-2">Skills</Label>
                        <div className="flex flex-wrap gap-2">
                          {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-slate-300">No skills specified</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <Label className="text-blue-400 block mb-2">Solana Wallet</Label>
                        <p className="text-slate-300 break-all">{user.walletAddressSOL || 'Not specified'}</p>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <Label className="text-blue-400 block mb-2">Ethereum Wallet</Label>
                        <p className="text-slate-300 break-all">{user.walletAddressETH || 'Not specified'}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <Button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-600 text-slate-100">
                        <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                      </Button>
                    )}
                  </motion.div>
                )}
              </TabsContent>
              <TabsContent value="projects">
                <div className="space-y-6">
                  {user.projectsCreated.length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center text-blue-400 text-xl"
                    >
                      No projects created
                    </motion.p>
                  ) : (
                    user.projectsCreated.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="bg-slate-700/30 border-blue-500/20">
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center text-blue-400">
                              <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
                              {project.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-300 mb-6">{project.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center bg-slate-800/50 p-3 rounded-lg">
                                <DollarSign className="mr-2 h-5 w-5 text-blue-400" />
                                <span className="text-slate-300">Budget: ${project.budget}</span>
                              </div>
                              <div className="flex items-center bg-slate-800/50 p-3 rounded-lg">
                                <Calendar className="mr-2 h-5 w-5 text-blue-400" />
                                <span className="text-slate-300">Time: {project.timeExpected || 'Not specified'}</span>
                              </div>
                              <div className="flex items-center bg-slate-800/50 p-3 rounded-lg">
                                <User className="mr-2 h-5 w-5 text-blue-400" />
                                <span className="text-slate-300">Experience: {project.experienceReq}</span>
                              </div>
                            </div>
                            <div className="mb-6">
                              <Label className="text-blue-400 block mb-2">Required Skills</Label>
                              <div className="flex flex-wrap gap-2">
                                {project.skillsRequired && project.skillsRequired.length > 0 ? (
                                  project.skillsRequired.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300">
                                      {skill}
                                    </Badge>
                                  ))
                                ) : (
                                  <p className="text-slate-300">No specific skills required</p>
                                )}
                              </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                              <Label className="text-blue-400 block mb-2">Client Information</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                  <User className="mr-2 h-5 w-5 text-blue-400" />
                                  <span className="text-slate-300">{project.client.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-5 w-5 text-blue-400" />
                                  <span className="text-slate-300">{project.client.email}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end p-2">
                            <button
                                onClick={() => router.push(`/projects/${project.id}/feature`)}
                                className="bg-blue-500 hover:bg-blue-600 text-slate-100 mx-3 py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                              >
                                Feature Project
                              </button>
                              <button
                                onClick={() => router.push(`/projects/${project.id}/proposals`)}
                                className="bg-blue-500 hover:bg-blue-600 text-slate-100 py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                              >
                                View Proposals
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
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
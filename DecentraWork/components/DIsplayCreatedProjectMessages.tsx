'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, User, Send, ChevronRight, Loader2, CheckCircle } from 'lucide-react'
import { AlertDialog, AlertDialogDescription, AlertDialogContent, AlertDialogHeader, AlertDialogCancel, AlertDialogFooter, AlertDialogTitle, AlertDialogAction } from './ui/alert-dialog'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'

type UserDetails = {
  id: number
  name: string
  email: string
} | null

type Project = {
  id: number
  title: string
  client: UserDetails
  assigned: UserDetails
  isCompleted: boolean
}

type Message = {
  id: number
  content: string
  createdAt: string
  senderId: number
  receiverId: number
  projectId: number
}

// MessageContent component remains unchanged
const MessageContent = ({ content }: { content: string }) => {
    const formatContent = (text: string) => {
      const lines: string[] = []
      let currentLine = ''
      
      for (let i = 0; i < text.length; i++) {
        currentLine += text[i]
        
        if (currentLine.length === 100 || i === text.length - 1) {
          if (i !== text.length - 1 && text[i + 1] !== ' ') {
            const lastSpaceIndex = currentLine.lastIndexOf(' ')
            if (lastSpaceIndex !== -1) {
              lines.push(currentLine.substring(0, lastSpaceIndex))
              currentLine = currentLine.substring(lastSpaceIndex + 1)
              i -= (currentLine.length - 1)
            } else {
              lines.push(currentLine)
              currentLine = ''
            }
          } else {
            lines.push(currentLine)
            currentLine = ''
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine)
      }
      
      return lines
    }
  
    const lines = formatContent(content)
  
    return (
      <div className="whitespace-pre-wrap break-words">
        {lines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    )
}

export default function CreatedProjectsMessagesComponent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [completeModal, setCompleteModal] = useState(false)
  const [clientCompletionModal, setClientCompletionModal] = useState(false)
  const [completionMessage, setCompletionMessage] = useState("")
  const { id } = useParams()

  useEffect(() => {
    fetchProjects()
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    if (selectedProject?.assigned && !isConnecting) {
      fetchProjectMessages(selectedProject.id)
      initializeWebSocket()
    }
    
    return () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [selectedProject])

  useEffect(() => {
    scrollToBottom()
  }, [messages])
  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`/api/user/account/${id}/created-projects`)
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }, [id])


  const fetchProjectMessages = async (projectId: number) => {
    if (!selectedProject?.assigned) return
    
    try {
      const response = await axios.get(`/api/projects/${projectId}/messages`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error fetching project messages:', error)
    }
  }

  const handleCompletionMessage = async () => {
    try {
      const response = await axios.put(`/api/projects/${id}/complete/client`, {completionMessage})
      if (response.status === 200) {
        console.log("Completion message sent successfully")
      }
    } catch (e) {
      console.error("Failed to send completion message:", e)
    }
  }
  
  const handleComplete = async () => {
    try {
      const response = await axios.put(`/api/projects/${selectedProject?.id}/complete`)
  
      if (response.status === 200) {
        setSelectedProject(prev => prev ? { ...prev, isCompleted: true} : null)
        setProjects(prev => prev.map(p => p.id === selectedProject?.id ? { ...p, isCompleted: true } : p))
        setClientCompletionModal(true)
  
        if (socket?.readyState === WebSocket.OPEN) {
          socket.close()
        }
      } else {
        console.error("Failed to complete the project.")
      }
    } catch (error) {
      console.error("An error occurred while completing the project:", error)
    } finally {
      setCompleteModal(false)
    }
  }
  
  const initializeWebSocket = () => {
    if (!selectedProject?.assigned) return
    
    setIsConnecting(true)
    const ws = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL!)
    
    ws.onopen = () => {
      console.log('WebSocket connection established')
      setSocket(ws)
      setIsConnecting(false)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as Message
        setMessages((prevMessages) => [...prevMessages, message])
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnecting(false)
    }

    ws.onclose = () => {
      console.log('WebSocket connection closed')
      setSocket(null)
      setIsConnecting(false)
    }
  }

  const sendMessage = () => {
    if (!selectedProject?.assigned || !newMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN) {
      return
    }

    const messageData = {
      content: newMessage.trim(),
      senderId: selectedProject.client!.id,
      receiverId: selectedProject.assigned.id,
      projectId: selectedProject.id,
    }

    try {
      socket.send(JSON.stringify(messageData))
      
      const optimisticMessage: Message = {
        id: Date.now(),
        ...messageData,
        createdAt: new Date().toISOString(),
      }
      setMessages((prevMessages) => [...prevMessages, optimisticMessage])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-[#0a0b0d] text-gray-100">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0iIzFhMWIxZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5 pointer-events-none"></div>
      
      <div className="w-1/4 border-r border-gray-800 p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-indigo-400">Projects</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : (
              <AnimatePresence>
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-between p-4 mb-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedProject?.id === project.id ? 'bg-indigo-900/30' : 'hover:bg-[#1a1b1e]'
                    } ${project.isCompleted ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-indigo-300">{project.title}</span>
                      <span className="text-xs text-gray-400">
                        {project.assigned ? project.assigned.name : 'No one assigned'}
                      </span>
                    </div>
                    {project.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-indigo-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-indigo-500" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>
        </motion.div>
      </div>
      
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {selectedProject ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-indigo-400 flex items-center">
                <MessageCircle className="mr-3 h-6 w-6" />
                {selectedProject.assigned ? 
                  `Chat with ${selectedProject.assigned.name}` : 
                  'No Freelancer Assigned'
                }
              </h2>
              <div className="flex items-center space-x-4">
                {!selectedProject.isCompleted && (
                  <Button 
                    variant="outline" 
                    className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border-indigo-500/50"
                    onClick={() => setCompleteModal(true)}
                  >
                    Complete Project
                  </Button>
                )}
                {selectedProject.isCompleted && (
                  <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-none">
                    Completed
                  </Badge>
                )}
                {isConnecting && selectedProject.assigned && (
                  <motion.span 
                    className="text-sm text-indigo-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    Connecting...
                  </motion.span>
                )}
              </div>
            </div>
            {selectedProject.assigned ? (
              <Card className="flex-1 bg-[#1a1b1e] border-gray-800 rounded-xl overflow-hidden">
                <CardContent className="p-6 flex flex-col h-full">
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <AnimatePresence>
                      {messages.map((message, index) => {
                        const isClient = message.senderId === selectedProject.client!.id
                        const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${isClient ? 'justify-end' : 'justify-start'} mb-4`}
                          >
                            {!isClient && showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                                <User className="h-4 w-4 text-indigo-100" />
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${isClient ? 'bg-indigo-600 text-indigo-100' : 'bg-[#2a2b2e] text-gray-300'
                              }`}
                            >
                              <MessageContent content={message.content} />
                            </div>
                            {isClient && showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center ml-3">
                                <User className="h-4 w-4 text-indigo-100" />
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                  <Separator className="my-4 bg-gray-800" />
                  <motion.div 
                    className="flex items-center mt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={selectedProject.isCompleted ? "Project Completed. No new messages allowed." : "Type your message..."}
                      disabled={!socket || socket.readyState !== WebSocket.OPEN || selectedProject.isCompleted}
                      className="flex-grow mr-3 bg-[#2a2b2e] text-gray-300 border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!socket || socket.readyState !== WebSocket.OPEN || selectedProject.isCompleted}
                      className="bg-indigo-600 text-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-1 bg-[#1a1b1e] border-gray-800 rounded-xl overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <User className="h-16 w-16 text-indigo-500 mb-4" />
                  <p className="text-xl text-gray-400 text-center">
                    No freelancer has been assigned to this project yet.
                  </p>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Chat functionality will be available once a freelancer is assigned.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-xl text-gray-400">Select a project to start chatting</p>
            </div>
          </motion.div>
        )}
      </div>
      
      <AlertDialog open={completeModal} onOpenChange={setCompleteModal}>
        <AlertDialogContent className="bg-[#1a1b1e] border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-indigo-400">Complete this project?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. The project will be marked as completed and all ongoing tasks will be finalized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#2a2b2e] text-gray-300 hover:bg-[#3a3b3e]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} className="bg-indigo-600 text-indigo-100 hover:bg-indigo-700">Complete Project</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clientCompletionModal} onOpenChange={setClientCompletionModal}>
        <AlertDialogContent className="bg-[#1a1b1e] border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-indigo-400">Final words for freelancer</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Please describe the freelancer&apos;s work and how satisfied you were with their performance. (Leaving this field empty will indicate that the job was completed to your satisfaction.)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              value={completionMessage}
              onChange={(e) => setCompletionMessage(e.target.value)}
              placeholder="Share your thoughts about the completed project..."
              className="bg-[#2a2b2e] text-gray-300 border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#2a2b2e] text-gray-300 hover:bg-[#3a3b3e]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompletionMessage}
              className="bg-indigo-600 text-indigo-100 hover:bg-indigo-700"
            >
              Submit Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams} from 'next/navigation'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, User, Send, ChevronRight, Loader2,CheckCircle,DollarSign } from 'lucide-react'
import { Card,CardContent } from './ui/card'
import { AlertDialog,AlertDialogDescription,AlertDialogContent,AlertDialogHeader,AlertDialogCancel,AlertDialogFooter,AlertDialogTitle,AlertDialogAction } from './ui/alert-dialog'
import { Textarea } from './ui/textarea'
type UserDetails = {
  id: number
  name: string
  email: string
}

type Project = {
  id: number
  title: string
  client: UserDetails
  assigned: UserDetails
  isCompleted:boolean
}

type Message = {
  id: number
  content: string
  createdAt: string
  senderId: number
  receiverId: number
  projectId: number
}

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

export default function AssignedProjectComponent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showCollectMoneyDialog, setShowCollectMoneyDialog] = useState(false)
  const [finalMessage, setFinalMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const { id } = useParams()

  useEffect(() => {
    fetchProjects()
  }, [id])

  useEffect(() => {
    if (selectedProject && !isConnecting) {
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

  const fetchProjects = useCallback (async () => {
    try {
      const response = await axios.get(`/api/user/account/${id}/assigned-projects`)
      setProjects(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setIsLoading(false)
    }
  },[IDBCursor])

  const fetchProjectMessages = async (projectId: number) => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/messages`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error fetching project messages:', error)
    }
  }

  const handleCollectMoney = () => {
    setShowCollectMoneyDialog(true)
  }

  const handleSubmitCollection = async () => {
    try {
      setIsSubmitting(true)
      await axios.put(`/api/projects/${selectedProject?.id}/complete/freelancer`, {
        finalMessage
      })
      
      setShowCollectMoneyDialog(false)
      setShowSuccessDialog(true)
      setFinalMessage('')
    } catch (error) {
      console.error('Error collecting money:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  const initializeWebSocket = () => {
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
    if (!newMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN || !selectedProject) {
      return
    }

    const messageData = {
      content: newMessage.trim(),
      senderId: selectedProject.assigned.id,
      receiverId: selectedProject.client.id,
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
          <h2 className="text-2xl font-bold mb-6 text-indigo-400">Assigned Projects</h2>
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
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-indigo-300">{project.title}</span>
                      <span className="text-xs text-gray-400">{project.client.name}</span>
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
      <AlertDialog open={showCollectMoneyDialog} onOpenChange={setShowCollectMoneyDialog}>
        <AlertDialogContent className="bg-[#1a1b1e] border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-indigo-400">Collect Project Payment</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Please provide any final words or instructions for the client before collecting your payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={finalMessage}
            onChange={(e) => setFinalMessage(e.target.value)}
            placeholder="Thank you for your business! Let me know if you need any clarifications..."
            className="min-h-[100px] mt-4 bg-[#2a2b2e] text-gray-300 border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitCollection}
              disabled={isSubmitting}
              className="bg-indigo-600 text-indigo-100 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Submit & Collect Payment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="bg-[#1a1b1e] border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-400">Payment Collection Initiated</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Your payment request has been submitted successfully. You should receive your payment within 5-7 business days.
              <strong>ENSURE THAT YOU HAVE YOUR PUBLIC ADDRESS CONFIGURED</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-green-600 text-green-100 hover:bg-green-700"
              onClick={() => setShowSuccessDialog(false)}
            >
              Got it, thanks!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
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
                Chat with {selectedProject.client.name}
              </h2>
              <div className="flex items-center space-x-4">
                {selectedProject.isCompleted && (
                  <Button 
                    variant="outline" 
                    className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border-indigo-500/50"
                    onClick={handleCollectMoney}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Collect Money
                  </Button>
                )}
                {isConnecting && (
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
            <Card className="flex-1 bg-[#1a1b1e] border-gray-800 rounded-xl overflow-hidden">
              <CardContent className="p-6 flex flex-col h-full">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isFreelancer = message.senderId === selectedProject.assigned.id
                      const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${isFreelancer ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          {!isFreelancer && showAvatar && (
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-indigo-100" />
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              isFreelancer ? 'bg-indigo-600 text-indigo-100' : 'bg-[#2a2b2e] text-gray-300'
                            }`}
                          >
                            <MessageContent content={message.content} />
                          </div>
                          {isFreelancer && showAvatar && (
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
                    placeholder={selectedProject.isCompleted ? "Project completed. No new messages allowed." : "Type your message..."}
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
    </div>
  )
}
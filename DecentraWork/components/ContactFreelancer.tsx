'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams } from 'next/navigation'
import axios from 'axios'

type Message = {
  id: number
  content: string
  createdAt: string
  senderId: number
  receiverId: number
}

type User = {
  id: number
  name: string
  email: string
}

export default function ContactFreelancerComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [client, setClient] = useState<User | null>(null)
  const [freelancer, setFreelancer] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { id } = useParams(); // Extract projectId from URL params
  const projectId = id;

  useEffect(() => {
    fetchProjectDetails()

    // Initialize WebSocket connection
    const ws = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL!)
    setSocket(ws)

    ws.onopen = () => {
      console.log('WebSocket connection established')
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      setMessages((prevMessages) => [...prevMessages, message])
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket connection closed')
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [projectId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchProjectDetails = useCallback( async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/messages`)
      setMessages(response.data.messages)
      setClient(response.data.client)
      setFreelancer(response.data.freelancer)
    } catch (error) {
      console.error('Error fetching project details:', error)
    }
  },[projectId])

  const sendMessage = () => {
    if (newMessage.trim() && socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        content: newMessage,
        senderId: client?.id,
        receiverId: freelancer?.id,
        projectId: Number(projectId),
      }
      socket.send(JSON.stringify(message))
      setNewMessage('')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto mb-4 p-4 border rounded">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-2 p-2 rounded ${
                message.senderId === client?.id ? 'bg-blue-100 text-right' : 'bg-gray-100'
              }`}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow mr-2"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </CardContent>
    </Card>
  )
}

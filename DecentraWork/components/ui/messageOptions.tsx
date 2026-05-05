'use client'

import React, { useState } from 'react'
import { MessageCircle, FolderOpen, Briefcase } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function MessageOptions() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleViewCreatedProjects = () => {
    setIsOpen(false)
    if (session?.user?.id) {
      router.push(`/user/${session.user.id}/created-projects/messages`)
    }
  }

  const handleViewAssignedProjects = () => {
    setIsOpen(false)
    if (session?.user?.id) {
      router.push(`/user/${session.user.id}/assigned-projects/messages`)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative p-2 text-gray-400 hover:text-indigo-400 transition-colors duration-300"
        >
          <MessageCircle className="h-5 w-5" />
          {/* Optional notification dot */}
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#0a0b0d]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-56 bg-[#1a1b1e] border border-gray-800 rounded-xl shadow-lg shadow-black/20 p-1"
        sideOffset={8}
      >
        <div className="flex flex-col space-y-1">
          <Button
            variant="ghost"
            className="flex items-center justify-start px-3 py-2 text-gray-400 hover:text-indigo-400 hover:bg-[#2a2b2e] rounded-lg transition-colors duration-300 w-full"
            onClick={handleViewCreatedProjects}
          >
            <div className="bg-indigo-500/10 p-1 rounded-lg mr-2">
              <FolderOpen className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm font-medium">Created Projects</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start px-3 py-2 text-gray-400 hover:text-indigo-400 hover:bg-[#2a2b2e] rounded-lg transition-colors duration-300 w-full"
            onClick={handleViewAssignedProjects}
          >
            <div className="bg-indigo-500/10 p-1 rounded-lg mr-2">
              <Briefcase className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm font-medium">Assigned Projects</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
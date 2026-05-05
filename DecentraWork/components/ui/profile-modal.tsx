'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from 'next-auth/react'
import axios from 'axios'

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function ProfileCompletionModal({ isOpen, onClose, onComplete }: ProfileCompletionModalProps) {
  const { data: session } = useSession()
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [bio, setBio] = useState('')
  const [walletAddressSOL, setWalletAddressSOL] = useState('')
  const [walletAddressETH, setWalletAddressETH] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (session?.user?.id) {
      try {
        await axios.put(`/api/user/account/${session.user.id}`, {
          experience,
          skills: skills.split(',').map(skill => skill.trim()),
          bio,
          walletAddressETH,
          walletAddressSOL
        })
        onComplete()
        onClose() // Close modal after completion
      } catch (error) {
        console.error('Error updating profile:', error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0a0b0d] text-gray-100 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Please provide the following information to complete your profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-indigo-400">Experience</label>
            <Input
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-[#1a1b1e] border-gray-800 focus:border-indigo-500 text-gray-100 placeholder-gray-500"
              placeholder="e.g., 5 years in web development"
            />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-indigo-400">Skills (comma-separated)</label>
            <Input
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-[#1a1b1e] border-gray-800 focus:border-indigo-500 text-gray-100 placeholder-gray-500"
              placeholder="e.g., React, Node.js, TypeScript"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-indigo-400">Bio</label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#1a1b1e] border-gray-800 focus:border-indigo-500 text-gray-100 placeholder-gray-500"
              placeholder="Tell us about yourself..."
            />
          </div>
          <div>
            <label htmlFor="walletAddressSOL" className="block text-sm font-medium text-indigo-400">Solana Wallet Address</label>
            <Input
              id="walletAddressSOL"
              value={walletAddressSOL}
              onChange={(e) => setWalletAddressSOL(e.target.value)}
              className="w-full bg-[#1a1b1e] border-gray-800 focus:border-indigo-500 text-gray-100 placeholder-gray-500"
              placeholder="Enter your Solana wallet address"
            />
          </div>
          <div>
            <label htmlFor="walletAddressETH" className="block text-sm font-medium text-indigo-400">Ethereum Wallet Address</label>
            <Input
              id="walletAddressETH"
              value={walletAddressETH}
              onChange={(e) => setWalletAddressETH(e.target.value)}
              className="w-full bg-[#1a1b1e] border-gray-800 focus:border-indigo-500 text-gray-100 placeholder-gray-500"
              placeholder="Enter your Ethereum wallet address"
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300"
            >
              Complete Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster, toast } from 'react-hot-toast'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

// Define the response data structure from API
interface ApiResponse {
  msg: string;
}

export default function SignupForm() {
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleLogin = () => {
    router.push('/signin')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axios.post<ApiResponse>('/api/user/account', { name, email, password });

      // Show success toast on successful signup
      toast.success("You've successfully signed up."); 

      setTimeout(() => {
        router.push('/signin')
      }, 1000);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data?.msg || "There was a problem creating your account.";

      toast.error(errorMessage); // Show error toast
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-800 to-black p-4">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F2833',
            color: '#66FCF1',
          },
          duration: 3000,
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-800 rounded-lg shadow-xl overflow-hidden p-8"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-neutral-300">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-700 text-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-neutral-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-700 text-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-neutral-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-700 text-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-200">
            Already have an account?{' '}
            <Button onClick={handleLogin} className="font-medium text-blue-400 hover:text-blue-300">
              Log in
            </Button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

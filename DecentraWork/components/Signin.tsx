'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from "framer-motion"
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster, toast } from 'react-hot-toast' // Import Toaster and toast

export default function SigninForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        toast.error(result.error) // Show error toast
      } else {
        toast.success("You have successfully signed in.") // Show success toast
        router.push('/dashboard')
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.") // Show generic error toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-900">
      <Toaster // Add Toaster here
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
        className="flex-1 flex items-center justify-center p-10"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <div className="bg-zinc-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <motion.h2 
                className="text-4xl font-extrabold text-zinc-100 mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Welcome Back
              </motion.h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-zinc-700 border-2 border-zinc-600 focus:border-zinc-500 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
                  </div>
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-zinc-700 border-2 border-zinc-600 focus:border-zinc-500 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-zinc-600 hover:bg-zinc-700 text-zinc-100 py-2 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
            <div className="px-8 py-4 bg-zinc-900 text-center">
              <p className="text-sm text-zinc-400">
                Don&apos;t have an account?{' '}
                <Button
                  variant="link"
                  className="font-medium text-zinc-300 hover:text-zinc-200"
                  onClick={() => router.push('/signup')}
                >
                  Sign up
                </Button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

'use client'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import FeaturesSectionDemo from "./blocks/features-section-demo-2"
import { MeteorsDemo } from "./ui/meteorEffect"
import { TypewriterEffectSmoothEffect } from "./ui/typewriter"
import GridPattern from "./ui/animated-grid-pattern"
import { cn } from "@/lib/utils"
import { OrbitingCirclesEffect } from "./ui/orbit"
import { useRouter } from "next/navigation"
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const router = useRouter();
  const handleGetStarted = () =>{
    router.push('/signup')
    }
  
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Landing Section */}
      <div className="relative min-h-[80vh] lg:h-5/6">
        <GridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
          )}
        />
        
        <div className="relative overflow-hidden h-full">
          <motion.div 
            className="flex items-center justify-center h-full relative z-10 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center w-full max-w-4xl mx-auto">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Decentra<span className="text-indigo-500">Work</span>
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <div className="w-full">
                  <TypewriterEffectSmoothEffect />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Orbiting Circles Effect Below Buttons */}
      <div className="hidden md:block">
        <OrbitingCirclesEffect />
      </div>

      {/* About Section */}
      <motion.div
        className="bg-black py-12 md:py-20 text-center border-t border-indigo-500/20"
        {...fadeInUp}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-400">What is DecentraWork?</h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            DecentraWork is a revolutionary decentralized platform connecting freelancers and clients in a secure, transparent way. We leverage blockchain technology to redefine the future of work, ensuring trust, efficiency, and fairness in every interaction.
          </p>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="bg-black border-t border-indigo-500/20"
      >
        <FeaturesSectionDemo />
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        className="bg-black py-12 md:py-20 border-t border-indigo-500/20"
        {...fadeInUp}
      >
        <div className="text-3xl md:text-4xl text-center font-semibold mb-8 md:mb-12 px-4">
          How It Works
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
          <MeteorsDemo
            title="Step 1: Share Your Project Details"
            description="Kickstart your project journey by providing a detailed overview of your requirements, goals, and budget. Clearly outlining your needs helps connect you with the best-suited freelancers, making your vision a reality."
          />
          <MeteorsDemo
            title="Step 2: Receive Tailored Proposals"
            description="Top-tier freelancers review your project details and submit customized proposals that match your requirements. Browse through proposals, check profiles, and select the perfect candidate to bring your project to life."
          />
          <MeteorsDemo
            title="Step 3: Collaborate with Security and Ease"
            description="Work seamlessly with your chosen freelancer using our secure and private real-time chat. Our platform prioritizes safe collaboration with end-to-end support, ensuring smooth project completion and transparent communication every step of the way."
          />
        </div>
      </motion.div>

      {/* Call to Action Section */}
      <motion.div
        className="bg-black py-12 md:py-16 text-center border-t border-indigo-500/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-4 md:mb-6">Join the DecentraWork Community</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-10 leading-relaxed">
            Be part of the freelancing revolution. Sign up today to connect with talented professionals or find your next groundbreaking project.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full text-lg md:text-xl transition duration-300 ease-in-out">
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
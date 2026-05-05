'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "./ui/button";

export default function NavBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle routing for navigation
  const handleNavigation = (path:string) => {
    router.push(path);
  };

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.a 
            onClick={() => handleNavigation('/')}
            className="text-[#66FCF1] font-bold text-2xl tracking-wide cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            DecentraWork
          </motion.a>
          {/* Links for larger screens */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Listings */}
            <motion.a 
              onClick={() => handleNavigation('/dashboard')}
              className="text-[#C5C6C7] hover:text-[#66FCF1] transition-colors text-sm uppercase tracking-wider cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Listing
            </motion.a>
            {/* Sign Up Button */}
            <Button 
              onClick={() => handleNavigation('/signup')}
              className="bg-transparent border border-[#66FCF1] text-[#66FCF1] hover:bg-[#66FCF1] hover:text-[#0B0C10] transition-all duration-300 rounded-full px-6 py-2 text-sm font-semibold"
            >
              Sign Up
            </Button>
            {/* Sign In Button */}
            <Button 
              onClick={() => handleNavigation('/signin')}
              className="bg-transparent border border-[#66FCF1] text-[#66FCF1] hover:bg-[#66FCF1] hover:text-[#0B0C10] transition-all duration-300 rounded-full px-6 py-2 text-sm font-semibold"
            >
              Sign In
            </Button>
          </div>
          {/* Hamburger menu for mobile */}
          <motion.button
            className="text-[#C5C6C7] hover:text-[#66FCF1] transition-colors md:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </nav>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#1F2833] bg-opacity-90 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Listings */}
              <motion.a 
                onClick={() => { handleNavigation('/listing'); setIsMenuOpen(false); }}
                className="block py-2 text-[#C5C6C7] hover:text-[#66FCF1] transition-colors text-sm uppercase tracking-wider cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Listing
              </motion.a>
              {/* Sign Up */}
              <Button 
                onClick={() => { handleNavigation('/signup'); setIsMenuOpen(false); }}
                className="mt-4 w-full bg-transparent border border-[#66FCF1] text-[#66FCF1] hover:bg-[#66FCF1] hover:text-[#0B0C10] transition-all duration-300 rounded-full px-6 py-2 text-sm font-semibold"
              >
                Sign Up
              </Button>
              {/* Sign In */}
              <Button 
                onClick={() => { handleNavigation('/signin'); setIsMenuOpen(false); }}
                className="mt-4 w-full bg-transparent border border-[#66FCF1] text-[#66FCF1] hover:bg-[#66FCF1] hover:text-[#0B0C10] transition-all duration-300 rounded-full px-6 py-2 text-sm font-semibold"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

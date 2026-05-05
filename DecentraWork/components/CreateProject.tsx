'use client'

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Search } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ProjectForm {
  title: string;
  description: string;
  budget: number | '';
  timeExpected: string;
  skillsRequired: string[];
  experienceReq: string;
}

const suggestedSkills = [
  "JavaScript", "React", "Node.js", "Python", "Java", "C++", "Ruby", "PHP",
  "Swift", "Kotlin", "Go", "Rust", "TypeScript", "SQL", "MongoDB", "AWS",
  "Docker", "Kubernetes", "Machine Learning", "Data Science", "UI/UX Design",
  "GraphQL", "REST API", "Vue.js", "Angular", "Flutter", "React Native","NextJs"
];

export default function CreateProject() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProjectForm>({
    title: '',
    description: '',
    budget: '',
    timeExpected: '',
    skillsRequired: [],
    experienceReq: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [isSkillsMenuOpen, setIsSkillsMenuOpen] = useState(false);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'budget' ? (value === '' ? '' : Number(value)) : value,
    });
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);
    if (value.trim()) {
      const filtered = suggestedSkills.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !formData.skillsRequired.includes(skill)
      );
      setFilteredSkills(filtered);
      setIsSkillsMenuOpen(true);
    } else {
      setFilteredSkills(suggestedSkills.filter(skill => !formData.skillsRequired.includes(skill)));
      setIsSkillsMenuOpen(true);
    }
  };

  const addSkill = (skill: string) => {
    if (!formData.skillsRequired.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill]
      }));
    }
    setSkillInput('');
    setFilteredSkills(suggestedSkills.filter(s => !formData.skillsRequired.includes(s) && s !== skill));
    skillInputRef.current?.focus();
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }));
    setFilteredSkills(prev => [...prev, skillToRemove].sort());
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/projects', {
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        timeExpected: formData.timeExpected,
        skillsRequired: formData.skillsRequired,
        experienceReq: formData.experienceReq,
      });

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Project created successfully!",
          variant: "default",
        });
        router.push('/dashboard');
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsSkillsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setFilteredSkills(suggestedSkills);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-zinc-900 to-slate-600 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-2xl w-full p-8 bg-gray-800 bg-opacity-90 rounded-lg shadow-xl"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-center mb-8 text-amber-400"
        >
          Create New Project
        </motion.h2>
        <form onSubmit={handleSubmit} className="space-y-6" ref={formRef}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-amber-300 mb-1">Title</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a catchy title..."
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-150 ease-in-out"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-amber-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Provide a detailed description..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-150 ease-in-out"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex space-x-4"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-amber-300 mb-1">Budget</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-400">
                  $
                </span>
                <input
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  className="w-full pl-7 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-150 ease-in-out"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-amber-300 mb-1">Time Expected</label>
              <input
                name="timeExpected"
                type="text"
                value={formData.timeExpected}
                onChange={handleChange}
                placeholder="e.g., 2 weeks"
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-150 ease-in-out"
              />
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-amber-300 mb-1">Experience Required</label>
            <select
              name="experienceReq"
              value={formData.experienceReq}
              onChange={handleChange}
              onFocus={() => setIsSkillsMenuOpen(false)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-150 ease-in-out"
            >
              <option value="">Select experience level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Experienced">Experienced</option>
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-amber-300 mb-1 ">Required Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              <AnimatePresence>
                {formData.skillsRequired.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-amber-500 text-gray-900 px-3 z-50 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <div className="relative">
              <input
                type="text"
                ref={skillInputRef}
                value={skillInput}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillInputKeyDown}
                onFocus={() => setIsSkillsMenuOpen(true)}
                placeholder="Search or add skills"
                className="w-full px-4 py-2 pl-10 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-150 ease-in-out"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <AnimatePresence>
                {isSkillsMenuOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-1 bg-gray-700 bg-opacity-100 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto top-full"
                  >
                    {filteredSkills.length > 0 ? (
                      filteredSkills.map((skill, index) => (
                        <li
                          key={index}
                          onClick={() => addSkill(skill)}
                          className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-white flex items-center"
                        >
                          <Plus size={14} className="mr-2" />
                          {skill}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-400">No matching skills found</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-amber-500 text-gray-900 py-3 px-4 rounded-md hover:bg-amber-400 transition duration-150 ease-in-out font-medium text-lg shadow-md"
          >
            Create Project
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
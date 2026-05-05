'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, DollarSign, Briefcase, LogOut, Filter, Sparkles, PlusCircle, AlertCircle, MessageSquare, BarChart, Eye, Clock, Tag, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import ProfileCompletionModal from './ui/profile-modal';
import MessageOptions from './ui/messageOptions';

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  timeExpected: string;
  skillsRequired: string[];
  experienceReq: string;
  createdAt: string;
  clientId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  experience: string | null;
  skills: string[] | null;
  bio: string | null;
}

const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function DashboardComponent() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [budgetRange, setBudgetRange] = useState<number[]>([0, 10000]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const { data: session, status } = useSession();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [featuredProjects,setFeaturedProjects]=useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchProjects(),
          checkProfileCompletion(),
          fetchAssignedProjects(),
          fetchCreatedProjects(),
          fetchFeaturedProjects()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      loadData();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleApply = async (projectId: number) => {
    router.push(`/projects/${projectId}/apply`);
  };

  const handleViewProposals = (projectId: number) => {
    router.push(`/projects/${projectId}/proposals`);
  };
  const handleViewMessagesCreated = () => {
    if (session?.user?.id) {
      router.push(`/user/${session.user.id}/created-projects/messages`);
    } else {
      console.error("User session not found");
    }
  };
  
  const handleViewMessagesAssigned = () => {
    if (session?.user?.id) {
      router.push(`/user/${session.user.id}/assigned-projects/messages`);
    } else {
      console.error("User session not found");
    }
  };
  
  
  const fetchAssignedProjects = useCallback( async () => {
    if (status === "authenticated" && session?.user?.id) {
      try {
        const response = await axios.get(`/api/user/account/${session.user.id}/assigned-projects`);
        setAssignedProjects(response.data);
      } catch(e) {
        console.error(e);
      }
    }
  },[session]);

  const fetchCreatedProjects = useCallback(async () => {
    if (status === "authenticated" && session?.user?.id) {
      try {
        const response = await axios.get(`/api/user/account/${session.user.id}/created-projects`);
        setCreatedProjects(response.data);
      } catch(e) {
        console.error(e);
      }
    }
  },[session]);

  const checkProfileCompletion = useCallback( async () => {
    if (status === "authenticated" && session?.user?.id) {
      try {
        const response = await axios.get(`/api/user/account/${session.user.id}`);
        const userData: User = response.data;
        const isComplete = Boolean(userData.experience && userData.skills && userData.skills.length > 0 && userData.bio);
        setIsProfileComplete(isComplete);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsProfileComplete(false);
      }
    } else {
      setIsProfileComplete(null);
    }
  },[session]);

  const handleCreateProject = () => {
    router.push('/projects/create');
  };

  const handleMyProposals = () => {
    if (status === "authenticated" && session?.user?.id) {
      router.push(`/user/${session.user.id}/proposals`);
    } else if (status === "unauthenticated") {
      router.push('/login');
    }
  };

  const handleMyProfile = () => {
    if (status === "authenticated" && session?.user?.id) {
      router.push(`/user/${session.user.id}`);
    } else if (status === "unauthenticated") {
      router.push('/login');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      const data = response.data;
      setProjects(data);
      const skills = Array.from(new Set(data.flatMap((project: Project) => project.skillsRequired)));
      setAllSkills(skills as string[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  const fetchFeaturedProjects = async () =>{
    try {
      const response = await axios.get('/api/projects/featured');
      const data = response.data;
      setFeaturedProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }
  const handleFeatureProject = async ()=>{
    router.push(`/user/${session?.user.id}`)
  }


  const FeaturedProjectSkeleton = () => (
    <div className="animate-pulse">
      <Card className="bg-[#1a1b1e] border border-gray-800 rounded-xl overflow-hidden h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="h-6 w-20 bg-gray-700 rounded-full" />
            <div className="h-4 w-24 bg-gray-700 rounded-full" />
          </div>
          <div className="h-6 w-3/4 bg-gray-700 rounded-full mt-3" />
        </CardHeader>
        <CardContent>
          <div className="h-16 w-full bg-gray-700 rounded mb-4" />
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-gray-700 rounded-full" />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 w-20 bg-gray-700 rounded-full" />
            <div className="h-4 w-24 bg-gray-700 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const ProjectCardSkeleton = () => (
    <Card className="bg-transparent border-b border-gray-800/50">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-700 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-700 rounded-full w-full animate-pulse" />
          </div>
          <div className="h-6 w-24 bg-gray-700 rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-3 gap-4 mb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-700 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-16 bg-gray-700 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="flex justify-end">
          <div className="h-8 w-24 bg-gray-700 rounded-full animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
  
  const SidebarProjectSkeleton = () => (
    <div className="p-4 flex justify-between items-center animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 bg-gray-700 rounded-full" />
        <div className="h-4 w-32 bg-gray-700 rounded-full" />
      </div>
      <div className="flex space-x-2">
        <div className="h-8 w-8 bg-gray-700 rounded-full" />
        <div className="h-8 w-8 bg-gray-700 rounded-full" />
      </div>
    </div>
  );
  const filteredProjects = projects.filter(project =>
    (project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedSkill === 'all' || project.skillsRequired.includes(selectedSkill)) &&
    (project.budget >= budgetRange[0] && project.budget <= budgetRange[1]) &&
    (selectedExperience.length === 0 || selectedExperience.includes(project.experienceReq))
  );
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-gray-100">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0iIzFhMWIxZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5 pointer-events-none"></div>

      <motion.header 
        className="fixed w-full top-0 z-50 bg-[#0f1012]/90 backdrop-blur-xl border-b border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-4 sm:space-x-8"
              whileHover={{ scale: 1.02 }}
            >
              <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                Decentra<span className="text-indigo-500">Work</span>
              </h1>
              
              <div className="hidden md:flex items-center bg-[#1a1b1e]/50 rounded-full px-4 py-2 border border-gray-800">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  className="bg-transparent border-none focus:outline-none text-sm ml-2 w-64 placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <MessageOptions />

              <Button 
                className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 rounded-full px-4 sm:px-6"
                onClick={handleCreateProject}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Post Project</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-1">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-gray-100 transition-all duration-300 hover:ring-indigo-500">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className='text-black'>U</AvatarFallback>
                      </Avatar>
                      {isProfileComplete === false && (
                        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-[#0a0b0d]" />
                      )}
                    </motion.div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 bg-[#1a1b1e] border border-gray-800 rounded-xl shadow-xl">
                  <DropdownMenuItem onClick={handleMyProfile} className="hover:bg-[#2a2b2e] focus:bg-[#2a2b2e]">
                    <User className="mr-2 h-4 w-4 text-indigo-500" />
                    <span className='text-zinc-300'>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMyProposals} className="hover:bg-[#2a2b2e] focus:bg-[#2a2b2e]">
                    <Briefcase className="mr-2 h-4 w-4 text-indigo-500" />
                    <span className='text-zinc-300'>My Proposals</span>
                  </DropdownMenuItem>
                  {isProfileComplete === false && (
                    <DropdownMenuItem onClick={() => setShowProfileModal(true)} className="hover:bg-[#2a2b2e] focus:bg-[#2a2b2e]">
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      <span className='text-zinc-300'>Complete Profile</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-[#2a2b2e] focus:bg-[#2a2b2e]">
                    <LogOut className="mr-2 h-4 w-4 text-indigo-500" />
                    <span className='text-zinc-300'>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="pt-28 pb-12 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center mb-8">
                  <Sparkles className="h-6 w-6 text-indigo-500 mr-3" />
                  <h2 className="text-2xl font-bold">Featured Projects</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  { isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                      <FeaturedProjectSkeleton key={i} />
                    ))
                  ) :(featuredProjects.length > 0 ? (
    featuredProjects.slice(0, 2).map((project) => (
      <motion.div
        key={project.id}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="bg-[#1a1b1e] border border-indigo-500/20 rounded-xl overflow-hidden h-full shadow-lg shadow-indigo-500/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge className="bg-indigo-500/10 text-indigo-400 border-none">
                {project.experienceReq}
              </Badge>
              <span className="text-sm text-gray-400">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            <CardTitle className="text-xl mt-3 text-gray-100">
              {project.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.skillsRequired.slice(0, 3).map((skill) => (
                <Badge key={skill} className="bg-[#2a2b2e] text-indigo-400 border-none">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-indigo-500" />
                <span className="text-sm text-gray-400">${project.budget}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                <span className="text-sm text-gray-400">{project.timeExpected}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))
  ) : (
    <div className="col-span-1 md:col-span-2 text-center py-10">
      <p className="text-gray-400 text-lg mb-4">No featured projects currently</p>
      <Button
        size="lg"
        className="bg-indigo-500 hover:bg-indigo-600 text-white"
        onClick={handleFeatureProject}
      >
        Feature Your Project
      </Button>
    </div>
  ))}
</div>

              </motion.div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/6">
                  <Card className="bg-[#1a1b1e] border border-gray-800 rounded-xl sticky top-24">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Filter className="h-5 w-5 text-indigo-500 mr-2" />
                        Filters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Budget Range</label>
                        <Slider
                          defaultValue={budgetRange}
                          max={10000}
                          step={100}
                          onValueChange={setBudgetRange}
                          className="mt-2"
                        />
                        <div className="flex justify-between mt-2 text-sm text-gray-400">
                          <span>${budgetRange[0]}</span>
                          <span>${budgetRange[1]}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Skills</label>
                        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                          <SelectTrigger className="bg-[#2a2b2e] border-gray-700">
                            <SelectValue placeholder="Select skill" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2a2b2e] border-gray-700">
                            <SelectItem value="all">All Skills</SelectItem>
                            {allSkills.map((skill) => (
                              <SelectItem key={skill} value={skill}>
                                {skill}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Experience Level</label>
                        <div className="space-y-2">
                          {experienceLevels.map((level) => (
                            <div key={level} className="flex items-center">
                              <Checkbox
                                id={level}
                                checked={selectedExperience.includes(level)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedExperience([...selectedExperience, level]);
                                  } else {
                                    setSelectedExperience(selectedExperience.filter((exp) => exp !== level));
                                  }
                                }}
                                className="border-gray-700"
                              />
                              <label htmlFor={level} className="ml-2 text-sm text-gray-400">
                                {level}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:w-3/4">
                  <h2 className="text-2xl font-bold mb-6">All Projects</h2>
                  <div className="space-y-6">
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                      ))
                    ) : (filteredProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
 <Card className="bg-transparent border-b border-gray-800/50 hover:bg-[#1a1b1e]/30 transition-colors group">
  <CardHeader className="p-4 pb-2">
    <div className="flex justify-between items-start gap-4">
      <div className="min-w-0 flex-1"> {/* min-w-0 ensures text truncation works */}
        <CardTitle className="text-base text-gray-100 mb-1 truncate">
          {project.title}
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm line-clamp-2 h-10"> {/* Fixed height for 2 lines */}
          {project.description}
        </CardDescription>
      </div>
      <Badge 
        className="bg-indigo-500/10 text-indigo-400 border-none px-2 py-0.5 shrink-0 whitespace-nowrap text-xs"
        variant="secondary"
      >
        {project.experienceReq}
      </Badge>
    </div>
  </CardHeader>

  <CardContent className="p-4 pt-2">
    <div className="grid grid-cols-3 gap-4 mb-3">
      <div className="flex items-center overflow-hidden">
        <DollarSign className="h-4 w-4 text-indigo-500 shrink-0 mr-2" />
        <span className="text-xs text-gray-400 truncate">${project.budget}</span>
      </div>
      <div className="flex items-center overflow-hidden">
        <Clock className="h-4 w-4 text-indigo-500 shrink-0 mr-2" />
        <span className="text-xs text-gray-400 truncate">{project.timeExpected}</span>
      </div>
      <div className="flex items-center overflow-hidden">
        <Tag className="h-4 w-4 text-indigo-500 shrink-0 mr-2" />
        <span className="text-xs text-gray-400 truncate">{project.skillsRequired.length} skills</span>
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5 mb-3 max-h-12 overflow-hidden">
      {project.skillsRequired.map((skill) => (
        <Badge 
          key={skill} 
          variant="secondary"
          className="bg-[#2a2b2e]/50 text-indigo-400 border-none px-1.5 py-0.5 text-xs"
        >
          {skill}
        </Badge>
      ))}
    </div>

    <div className="flex justify-end">
      <Button
        variant={"default"}
        size="sm"
        className=" hover:bg-indigo-500/20 text-indigo-400 text-xs group-hover:text-indigo-300 transition-colors"
        onClick={() => handleApply(project.id)}
      >
        <Eye className="h-3.5 w-3.5 mr-1.5" />
        View Details
      </Button>
    </div>
  </CardContent>
</Card>
                      </motion.div>
                    )))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/4 mt-16">
              <Card className="bg-[#1a1b1e] border border-gray-800 rounded-xl top-24">
                <CardHeader>
                  <CardTitle className="text-lg">My Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="assigned" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="assigned">Assigned</TabsTrigger>
                      <TabsTrigger value="created">Created</TabsTrigger>
                    </TabsList>
                    <TabsContent value="assigned">
                      <div className="space-y-2 mt-4">
                        {isLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <SidebarProjectSkeleton key={i} />
                          ))
                        ) :assignedProjects.length > 0 ? (
                          assignedProjects.map(project=>(
                            <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#1a1b1e] border-b border-gray-800 hover:border-indigo-500/50 transition-all rounded-lg overflow-hidden mb-2 last:mb-0"
                          >
                            <div className="p-4 flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="bg-indigo-500/10 p-2 rounded-full">
                                  <Briefcase className="h-5 w-5 text-indigo-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-100 truncate">{project.title.slice(0,15)}...</span>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={handleViewMessagesAssigned}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm text-center">No assigned projects</p>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="created">
                      <div className="space-y-2 mt-4">
                        {createdProjects.length > 0 ? (
                          createdProjects.map(project=>(
                            <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#1a1b1e] border-b border-gray-800 hover:border-indigo-500/50 transition-all rounded-lg overflow-hidden mb-2 last:mb-0"
                          >
                            <div className="p-4 flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="bg-indigo-500/10 p-2 rounded-full">
                                  <Briefcase className="h-5 w-5 text-indigo-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-100 truncate">{project.title.slice(0,15)}...</span>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={handleViewMessagesCreated}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handleViewProposals(project.id)}
                                >
                                  <BarChart className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm text-center">No created projects</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showProfileModal && (
          <ProfileCompletionModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onComplete={() => {
              setIsProfileComplete(true);
              setShowProfileModal(false);
              checkProfileCompletion();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
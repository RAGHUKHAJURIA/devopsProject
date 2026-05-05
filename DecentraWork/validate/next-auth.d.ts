import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      experience: string | null;
      skills: string[];
      bio: string | null;
    }
  }

  interface JWT extends User {
    id: string;
    email: string;
    name: string;
    experience: string | null;
    skills: string[];
    bio: string | null;
  }
}
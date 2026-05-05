import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import client from '@/db';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client'
import { JWT } from "next-auth";

export const authValues: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'Enter Email Address' },
                password: { label: 'Password', type: 'password', placeholder: 'Enter Password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing Email or Password");
                }

                try {
                    const user: User | null = await client.user.findFirst({
                        where: { email: credentials.email }
                    });

                    if (!user) {
                        throw new Error("No user found with this email");
                    }

                    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                    if (!isValidPassword) {
                        throw new Error("Incorrect Password");
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        experience: user.experience,
                        skills: user.skills,
                        bio: user.bio,
                    };
                } catch (e) {
                    console.error(e);
                    throw new Error("Email/Password is Incorrect");
                }
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const { id, email, name, experience, skills, bio } = user as JWT; // Type assertion for user as JWT
                token.id = id;
                token.email = email;
                token.name = name;
                token.experience = experience;
                token.skills = skills;
                token.bio = bio;
            }
            return token;
            
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.experience = token.experience as string | null;
                session.user.skills = token.skills as string[];
                session.user.bio = token.bio as string | null;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 30 * 24 * 60 * 60,
    },
};

export default authValues;
import authValues from "@/lib/auth";
import NextAuth from "next-auth"

const handler = NextAuth(authValues);

export { handler as GET, handler as POST}
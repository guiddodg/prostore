import NextAuth, { NextAuthConfig } from 'next-auth'
import {PrismaAdapter} from '@auth/prisma-adapter'
import {prisma} from '@/db/prisma';
import authConfig from "@/auth.config";



export const config ={
    pages:{
        signIn:"/sign-in",
        error:"/sign-in"
    },
    session:{
        strategy:'jwt' as const,
        maxAge: 30*24*60*60, //30 days
    },
    adapter: PrismaAdapter(prisma),
    ...authConfig
} satisfies NextAuthConfig;

export const { handlers,auth,signIn, signOut} =NextAuth(config);
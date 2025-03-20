import NextAuth from 'next-auth'
import {PrismaAdapter} from '@auth/prisma-adapter'
import {prisma} from '@/db/prisma';
import type { NextAuthConfig } from 'next-auth';
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
    callbacks:{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ session, user,trigger, token } : any){
            // Set the user ID from the token
            session.user.id = token.sub;
            session.user.role = token.role;
            session.user.name = token.name;

            // If there is an update, set the user name
            if(trigger == 'update'){
                session.user.name = user.name
            }

            return session
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async jwt({token,user}:any){
            if(user){
                token.role = user.role;

                if(user.name ==='NO_NAME'){
                    token.name = user.email.split('@')[0];

                    await prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            name: token.name
                        }
                    })
                }
            }
            return token;
        },
    },
    ...authConfig
} satisfies NextAuthConfig;

export const { handlers,auth,signIn, signOut} =NextAuth(config);
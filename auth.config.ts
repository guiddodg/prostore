import type {NextAuthConfig} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { prisma } from "./db/prisma";


export default {
    providers:[
        Credentials({
                credentials:{
                    email: {type:'email'},
                    password:{type:'password'}
                },
                async authorize(credentials){
                    if (credentials == null) return null;
    
                    // Find user in db
                    const user = await prisma.user.findFirst({
                        where:{
                            email: credentials.email as string
                        }
                    })
    
                    // Check if user exists and pssw is ok
                    if (user && user.password){
                        const isMatch = compareSync(credentials.password as string, user.password)
                        
                        // password is correct?
                        if(isMatch){
                            return {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                            }
                        }
                    }
                    return null;
                }
            }) 
    ],
    trustHost: true
} as NextAuthConfig;
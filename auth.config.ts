import type {NextAuthConfig} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { prisma } from "./db/prisma";


export default {
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
import type {NextAuthConfig} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { prisma } from "./db/prisma";
import { cookies } from 'next/headers';
import { getCookie } from 'cookies-next';


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
    callbacks:{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async jwt({token,user,trigger,session}:any){
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
                if(trigger ==='signIn' || trigger === 'signUp'){
        
                    /*const cookiesObject = await getCookies;
                    console.log("cookiesObject",cookiesObject);*/
                    const sessionCartId = await getCookie('sessionCartId', {cookies});;

                    if(sessionCartId){
                        const sessionCart = await prisma.cart.findFirst({
                            where: { sessionCartId }
                        });

                        if(sessionCart){
                            await prisma.cart.deleteMany({
                                where: { userId: user.id }
                            })

                            await prisma.cart.update({
                                where: { id: sessionCart.id },
                                data: { userId: user.id }
                            })
                        }
                    }
                }
            }

            //Handle session updates
            if(session?.user.name && trigger ==='update'){
                token.name = session.user.name;
            }
            
            return token;
        },
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
        
    },
    //trustHost: true
} as NextAuthConfig;
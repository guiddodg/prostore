'use server';

import { signInFromSChema, signUpFromSChema } from "../validator";
import {signIn, signOut} from '@/auth'
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatErrors } from "../utils";


// Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData){
    try{
            const user = signInFromSChema.parse({
                email: formData.get('email'),
                password: formData.get('password'),
            });

            await signIn('credentials',user)

            return {
                success: true,
                message:'Signed in successfully'
            }
    }catch(error){
        if(isRedirectError(error)){
            throw error
        }

        return {
            success:false,
            message:'invalid credentials'
        }

    }
}

// Sign user out

export async function signOutUser(){
    await signOut();
}

// Sign up user
export async function signUpUser(prevState:unknown, formData:FormData){
    try{
        const user = signUpFromSChema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashSync(user.password,10),
                role: 'user'
            }            
        })

        await signIn('credentials',{
            email: user.email,
            password: user.password
        })

        return {
            success: true,
            message:'Signed up successfully'
        }
    }catch(error){
        if(isRedirectError(error)){
            throw error
        }
        console.log(error);

        return {
            success:false,
            message:formatErrors(error)
        }   
    }
}
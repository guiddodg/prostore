'use server';

import { shippingAddressSchema, signInFromSChema, signUpFromSChema, paymentMethodSchema, updateProfileSchema, updateUserSchema } from "../validator";
import {auth, signIn, signOut} from '@/auth'
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatErrors } from "../utils";
import { ShippingAddress } from "@/types";
import { z } from "zod";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";


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

//Get user byId
export async function getUserById(id:string) {
    const user = await prisma.user.findFirst({
        where: {
            id: id,
        },
    });
    if (!user) throw new Error('User not found');
    
    return user;
}

// Update the user's address
export async function updateUserAddress(data: ShippingAddress) {
    try{
        const session = await auth();
        const userId = await getUserById(session?.user?.id as string);
        await prisma.user.update({
            where: {
                id: userId.id,
            },
            data: {
                address: shippingAddressSchema.parse(data),
            },
        });
        
        return {
            success: true,
            message:`User's Address updated successfully`	
        }

    }catch(error){
        return {
            success:false,
            message:formatErrors(error)
        }
    }
}

// Update user's payment method
export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
    try{
        const session = await auth();
        const userId = await getUserById(session?.user?.id as string);
        const paymentMethod = paymentMethodSchema.parse(data)
    
        await prisma.user.update({
            where: {id: userId.id},
            data: {paymentMethod: paymentMethod.type},
        });
        
        return {
            success: true,
            message:`User's Payment Method updated successfully`	
        }

    }catch(error){
        return {
            success:false,
            message:formatErrors(error)
        }
    }
}

// Update user's profile
export async function updateUserProfile(data: z.infer<typeof updateProfileSchema>) {
    try{
        const session = await auth();
        const userId = await getUserById(session?.user?.id as string);
        const profile = updateProfileSchema.parse(data)
    
        //email should not be updated
        await prisma.user.update({
            where: {id: userId.id},
            data: {name: profile.name},
        });
        
        return {
            success: true,
            message:`User's Profile updated successfully`	
        }

    }catch(error){
        return {
            success:false,
            message:formatErrors(error)
        }
    }

    }

    export async function getAllUsers({
        limit = PAGE_SIZE,
        page,
        query,
    }:{
        limit?: number;
        page: number;
        query?: string;
    }) {
         const queryFilter:Prisma.UserWhereInput = query && query !=='all'? {
            name: {
                contains: query,
                mode: 'insensitive',
            } as Prisma.StringFilter,
        } : {};
        const users = await prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
               ...queryFilter
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    
        const totalUsers = await prisma.user.count();
    
        return {
            users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
        };
    }

    export async function deleteUser(id: string) {
        try{
            await prisma.user.delete({
                where: {
                    id: id,
                },
            });
            
            revalidatePath('/admin/users')
            
            return {
                success: true,
                message:`User deleted successfully`	
            }
    
        }catch(error){
            return {
                success:false,
                message:formatErrors(error)
            }
        }
    }

    export async function updateUser(user: z.infer<typeof updateUserSchema>) {
        try{
           await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    name: user.name,
                    role: user.role,
                },
            });
            revalidatePath('/admin/users')
            
            return {
                success: true,
                message:`User's Profile updated successfully`	
            }
    
        }catch(error){
            return {
                success:false,
                message:formatErrors(error)
            }
        }
    }
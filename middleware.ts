import {  NextResponse } from "next/server";
import authConfig from '@/auth.config';
import NextAuth from 'next-auth';

const {auth} = NextAuth(authConfig);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {

    if(req.cookies.get('sessionCartId')) return NextResponse.next();

    // Genera un UUID personalizado si es necesario en lugar de usar crypto
    const sessionCartId = (  
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  
            .replace(/x/g, () => (Math.random() * 16 | 0).toString(16))  
    ).toLowerCase();  
   // const sessionCartId = crypto.randomUUID();
    const newRequestHeader = new Headers(req.headers);
    
    const response = NextResponse.next( {
        request:{
        headers: newRequestHeader,
        }
    });
    response.cookies.set('sessionCartId',sessionCartId);
    return response;
    
});
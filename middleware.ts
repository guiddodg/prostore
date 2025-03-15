import { NextRequest, NextResponse } from "next/server";
import authConfig from '@/auth.config';
import NextAuth from 'next-auth';

const {auth} = NextAuth(authConfig);

export default auth((req: NextRequest) => {

    if(req.cookies.get('sessionCartId')) return NextResponse.next();

    const sessionCartId = crypto.randomUUID();
    const newRequestHeader = new Headers(req.headers);
    
    const response = NextResponse.next( {
        request:{
        headers: newRequestHeader,
        }
    });
    response.cookies.set('sessionCartId',sessionCartId);
    return response;
    
});
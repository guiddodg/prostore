import {  NextResponse } from "next/server";
import authConfig from '@/auth.config';
import NextAuth from 'next-auth';

const {auth} = NextAuth(authConfig);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
    // Este approch es muy cabeza, hay q hacer algo mejor
    const protectedPaths = [
        '/shipping-address',
        '/payment-method',
        '/place-order',
        '/profile',
        '/user/',
        '/order/',
        '/admin',
    ];

    //Get pathname from the req URL
    const { nextUrl } = req;

    const isAuthenticated = !!req.auth;
    const isProtectedRoute = protectedPaths.some((path) => nextUrl.pathname.match(path));

    //Check if the pathname is in the protectedPaths array
    if (isProtectedRoute && !isAuthenticated){
        return Response.redirect(new URL("/sign-in", nextUrl));
    }

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
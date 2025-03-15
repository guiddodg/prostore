import { Card,CardContent,CardDescription,CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignUpForm from "./form";

export const metadata: Metadata ={
    title:"Sign Up"
};


const SignUpPage = async (props:{
    searchParams:Promise<{
        callbackURL: string
    }>;
}) => {

    const {callbackURL} = await props.searchParams;

    const session = await auth();

    if(session) redirect(callbackURL || '/');

    return <div className="w-full max-w-md mx-auto">
        <Card>
            <CardHeader>
                <Link href='/' className="flex-center">
                    <Image 
                        src='/images/logo.svg' 
                        width={100}
                        height={100} 
                        alt={`${APP_NAME} logo`} 
                        priority={true}>
                    </Image>
                </Link>
                <CardTitle className="text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                    Enter yoour information below to sign up
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SignUpForm  />
            </CardContent>
        </Card>
    </div>;
}
 
export default SignUpPage;
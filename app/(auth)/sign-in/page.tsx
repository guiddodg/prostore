import { Card,CardContent,CardDescription,CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import CredentialsSignInForm from "./form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metada: Metadata ={
    title:"Sign In"
};

const SignInPage = async (props:{
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
                <CardTitle className="text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                    Sign int to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
        <CredentialsSignInForm />
            </CardContent>
        </Card>
    </div>;
}
 
export default SignInPage;
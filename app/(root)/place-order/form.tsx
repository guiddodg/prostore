'use client';

import { useFormStatus } from "react-dom";
import {Check,Loader} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/actions/order.actions";

const PlaceOrderForm = () => {
    const router = useRouter();

    const handleSubmit = async (event:React.FormEvent) => {
        event.preventDefault();

        const res = await createOrder();
        console.log(res);
        if(res.redirectTo) {
            router.push(res.redirectTo)
        };
    }
    const PlaceOrderButton = () => {
        const {pending} = useFormStatus();
        return (
            <Button className="w-full" disabled={pending}>
                { pending ? (
                    <Loader className="h-4 w-4 animate-spin" />
                ) : (
                    <Check className="h-4 w-4" />
                )  } 
                {' '}Place Order
            </Button>
        )
    }

    return <form onSubmit={handleSubmit} className="w-full">
            <PlaceOrderButton />
         </form>;
}
 
export default PlaceOrderForm;
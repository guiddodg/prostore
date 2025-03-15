'use client';

import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {  toast } from "sonner";
import { addItemToCart } from "@/lib/actions/cart.actions";
const AddToCart = ({item }:{item:CartItem}) => {
    const router = useRouter();

    const handleAddToCart = async()=>{
        const res = await addItemToCart(item);
        if(!res.success){
            toast.error(res.message,{
                className: "text-white",
                style: {
                    color: "white",
                    background: "red",
                }
            });
            return;
        }

        // Handle success add to cart
        toast(res.message,{
            action: {
                label: "Go To Cart",
                onClick: () => {
                    router.push('/cart');
                },
            },
        });
    }
    return <Button className="w-full" onClick={handleAddToCart} > <Plus /> Add to Cart </Button>;
}
 
export default AddToCart;
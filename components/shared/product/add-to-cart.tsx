'use client';

import { Cart,CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus,Loader } from "lucide-react";
import {  toast } from "sonner";
import { addItemToCart,removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ cart, item }:{cart?: Cart; item:CartItem}) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleAddToCart = async()=>{
        startTransition(async()=>{
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
        })
    }

    // Handle remove from cart
    const handleRemoveFromCart = async ()=>{
        startTransition(async()=>{
            const res = await removeItemFromCart(item.productId);
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
        
            toast.success(res.message);
            return;
        })
    }

    //Check if item is in cart
    const existItem = (cart?.items as CartItem[]).find((i) => i.productId === item.productId);

    return existItem ? 
    (<div>
        <Button type='button' variant='outline' onClick={handleRemoveFromCart} >
            {isPending ? (<Loader className="h-4 w-4 animate-spin" />) :
            (<Minus className="h-4 w-4" />)}

        </Button>
        <span className="px-2">{existItem.qty}</span>
        <Button type='button' variant='outline' onClick={handleAddToCart} >
        {isPending ? (<Loader className="h-4 w-4 animate-spin" />) :
            ( <Plus className="h-4 w-4" />)}
           
        </Button>
    </div>) :
    (
        <Button className="w-full" onClick={handleAddToCart} >
             {isPending ? (<Loader className="h-4 w-4 animate-spin" />) :(<Plus className="h-4 w-4" /> )}
            Add to Cart 
        </Button>
    );
}
 
export default AddToCart;
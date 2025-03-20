import { auth } from "@/auth";
import { getCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShippingAddress } from "@/types";
import  ShippingAddressForm from "./form";
import CheckoutSteps from "@/components/shared/checkout-steps";


export const metadata: Metadata = {
    title:"Shipping Address"
}
const ShippingAddressPage = async () => {
    const cart = await getCart();

    if(!cart || cart.items.length === 0) redirect('/cart');

    const session = await auth();
    const userId = await getUserById(session?.user?.id as string);

    if(!userId) throw new Error('Login required');

    const user = await getUserById(userId.id);

    if(!user) throw new Error('User not found');

    return  <>
    <CheckoutSteps current={1} />
        <ShippingAddressForm address={user.address as ShippingAddress} />
    </> ;
}
 
export default ShippingAddressPage;
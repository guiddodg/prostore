import { Metadata } from "next";
import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.actions";
import PaymentMethodForm from "./form";
import CheckoutSteps from "@/components/shared/checkout-steps";

export const metadata: Metadata = {
    title:"Select Payment Method"
}

const PaymentMethodPage = async () => {
    const session = await auth();
    const userId = await getUserById(session?.user?.id as string);

    if(!userId) throw new Error('Login required');

    const user = await getUserById(userId.id);


    return (
    <>
        <CheckoutSteps current={2} />
        <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </>
    );
}
 
export default PaymentMethodPage;
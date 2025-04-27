import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./table";
import { ShippingAddress } from "@/types";


export const metadata: Metadata = {
    title:"Order Details"
}

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
    const { id } = await props.params;

    const order = await getOrderById(id);

    if(!order) return notFound();


    return <OrderDetailsTable order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress
    }}
    paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string || "sb"}
    />;
}
 
export default OrderDetailsPage;
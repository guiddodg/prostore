'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { getCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem,PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";

export async function createOrder() {
    try{
        const session = await auth();
        const userId = session?.user?.id as string;
        if (!userId) throw new Error('Login required');
        const cart = await getCart();
        const user = await getUserById(userId);

        if(!cart || cart.items.length === 0) {
            return {
                success:false,
                message: 'Cart is empty',
                redirectTo: '/cart'
            }
        }

        if(!user.address) {
            return {
                success:false,
                message: 'Shipping address not found',
                redirectTo: '/shipping-address'
            }
        }

        if(!user.paymentMethod) {
            return {
                success:false,
                message: 'Payment method not found',
                redirectTo: '/payment-method'
            }
        }

        const order = insertOrderSchema.parse({
            userId: user.id,
            shippingAddress: user.address,
            paymentMethod: user.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
        });

        const insertedOrderId = await prisma.$transaction(async (tx) => {
            const insertedOrder =await tx.order.create({data: order});
            
            for(const item of cart.items as CartItem[]) {
                await tx.orderItem.create({data: {
                    ...item,
                    price: item.price, 
                    orderId: insertedOrder.id,
                }});
            }

            await tx.cart.update({where: {id: cart.id},
            data: {
                items: [],
                totalPrice: 0,
                itemsPrice: 0,
                taxPrice: 0,
                shippingPrice: 0
            }});

            return insertedOrder.id;
        })
        if(!insertedOrderId) throw new Error('Order not created');


        return {
            success: true,
             message: 'Order created successfully', 
             redirectTo: `/order/${insertedOrderId}`,
            }



    }catch(e){
        if(isRedirectError(e)) throw e
        return {success: false, message: formatErrors(e)};
    }
    
}

export async function getOrderById(orderId:string) {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId
        },
        include: {
            orderItems: true,
            user:{
                select: {
                    name: true,
                     email: true,
                    }
                }
            }
        });

    if(!order) throw new Error('Order not found');

    return convertToPlainObject(order);
}

// Create new paypal order
export async function createPayPalOrder(orderId: string){
    try{
        const order = await getOrderById(orderId);
        const response = await paypal.createOrder(Number(order.totalPrice));
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentResult: {
                    id: response.id,
                    email_address: '',
                    status: '',
                    pricePaid:0,
                }
            }
        });
        return {
            success:true,
            message: 'Item order created successfully',
            data: response.id,
        };
    }catch(e){
        if(isRedirectError(e)) throw e
        return {success: false, message: formatErrors(e)};
    }
}

// Approve paypal order and update order to paid
export async function approvePayPalOrder(orderId: string, data:{orderID:string}) {
    try{
        const order = await getOrderById(orderId);
        const response = await paypal.captureOrder(data.orderID);
        if(!response || response.id !== (order.paymentResult as PaymentResult)?.id ||
        response.status !== 'COMPLETED') throw new Error('Error in PayPal payment');
        
        await updateOrderToPaid({orderId, paymentResult: {
            id: response.id,
            email_address: response.payer.email_address,
            status: response.status,
            pricePaid: response.purchase_units[0]?.payments?.captures[0]?.amount?.value,
        }});

        revalidatePath(`/order/${orderId}`);
        return {
            success:true,
            message: 'Your order has been paid successfully',
        };
    }catch(e){
        if(isRedirectError(e)) throw e
        return {success: false, message: formatErrors(e)};
    }   
                    
}

// Update order to paid
async function updateOrderToPaid({orderId, paymentResult}: {
    orderId:string, paymentResult?:PaymentResult}) {
    const order = await getOrderById(orderId);

    if (order.isPaid) throw new Error('Order already paid');

    //transaction to update order and account for product stock
    await prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: -item.qty,
                    },
                },
            });
        }
        await tx.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                paidAt: new Date(),
                paymentResult: paymentResult
            }
        });
    });

    // Get updated order after transaction
    const updatedOrder = await prisma.order.findFirst({
        where: { id: orderId },
        include: {
            orderItems: true,
            user: {select: { name: true,email: true }},
        },
    });

    if (!updatedOrder) throw new Error('Order not found after update');
    revalidatePath(`/order/${orderId}`);
    return updatedOrder;

}

// Get user's orders
export async function getMyOrders({limit = PAGE_SIZE,page}:{limit?: number;page: number;})  {
    const session = await auth();
    const userId = session?.user?.id as string;
    if (!userId) throw new Error('Login required');
    const orders = await prisma.order.findMany({
        where: {userId: userId},
        orderBy: { createdAt: 'desc'},
        take:limit,
        skip: page ? (page - 1) * limit : 0,
    });

    const dataCount = await prisma.order.count({
        where: {userId: userId},
    });

    return {
        orders,
        totalPages: Math.ceil(dataCount / limit),
    };
}
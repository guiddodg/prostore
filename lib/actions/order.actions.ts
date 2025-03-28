'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { getCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";

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
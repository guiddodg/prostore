'use server';

import { cookies } from "next/headers";

import { CartItem } from "@/types";
import { convertToPlainObject, formatErrors, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validator";
import { revalidatePath } from "next/cache";
import {  Prisma } from "@prisma/client";

// Calculate cart prices
const calcPrices = (items: CartItem[]) => {
    const itemsPrice = round2(
        items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
    // esta transformacion puede q esté de mas    
    return {
        itemsPrice:itemsPrice.toFixed(2),
        shippingPrice:shippingPrice.toFixed(2),
        taxPrice:taxPrice.toFixed(2),
        totalPrice:totalPrice.toFixed(2),
    };

}

export async function addItemToCart(data: CartItem) {
    try{
      
        const item = cartItemSchema.parse(data);
        
        const cart = await getCart()
        if(cart.id === '') {
           await createCart(item);
           return {
            success:true,
            message: `${item.name} added to cart`
          }
        }
        
        const result = await updateCart(cart, item);

        return {
          success:true,
          message: result
        }
       
    }catch(error){
        return {
            success:false,
            message:formatErrors(error)
        }
    }
}


export async function getCart(){
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if(!sessionCartId) throw new Error('Cart session Cart not found');
  
  // Get session and user ID
  const session = await auth();
  const userId=session?.user?.id ? (session.user.id as string) : undefined;
  //Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? {userId:userId} : {sessionCartId: sessionCartId},
  });

  if (!cart) {
    return convertToPlainObject({
      id: "",
    createdAt: new Date(),
    userId: "",
    sessionCartId: "",
    items: [] as CartItem[] ,
    itemsPrice: "",
    totalPrice: "",
    shippingPrice: "",
    taxPrice: "",
    });
  }

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });

}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCart(item:any){
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if(!sessionCartId) throw new Error('Cart session Cart not found');
  
  // Get session and user ID
  const session = await auth();
  const userId=session?.user?.id ? (session.user.id as string) : undefined;
  const newCart = insertCartSchema.parse({
    userId: userId,
    sessionCartId: sessionCartId,
    items:[item],
    ...calcPrices([item])
});

await prisma.cart.create({data: newCart});

return convertToPlainObject({
    ...newCart,
    items: newCart.items as CartItem[],
    itemsPrice: newCart.itemsPrice.toString(),
    totalPrice: newCart.totalPrice.toString(),
    shippingPrice: newCart.shippingPrice.toString(),
    taxPrice: newCart.taxPrice.toString(),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCart(cart: any, item: any):Promise<string> {
    const product = await prisma.product.findFirst({
    where: { id: item.productId }});

    if (!product) throw new Error('Product out of stock');

    //Check if item is already in cart
    const existItem = (cart.items as CartItem[]).find(
      (i) => i.productId === item.productId
    );  
  
    if (!existItem) {
      if(product.stock <  1) throw new Error('Product out of stock');
      
      cart.items.push(item)

    }else{
      // Check stock
      if(product.stock < existItem.qty + 1){
        throw new Error('Product out of stock');
      }

      // Increase the quantity
      (cart.items as CartItem[]).find(
        (i) => i.productId === item.productId
      )!.qty = existItem.qty + 1;  
    }

    // Save to database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput,
        ...calcPrices(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return `${item.name} ${existItem ? 'updated in' : 'added to'}  cart`;
  }
    
  export async function removeItemFromCart(productId:string) {
    try{
      // Check for the cart cookie
      const sessionCartId = (await cookies()).get('sessionCartId')?.value;
      if(!sessionCartId) throw new Error('Cart session Cart not found');
     
      // Get product
      const product = await prisma.product.findFirst({
        where: { id: productId }}); 

      if(!product) throw new Error('Product not found');

      // Get user cart
      const cart = await getCart();

      // Check for item
      const item = (cart.items as CartItem[]).find(
        (i) => i.productId === productId
      );

      if(!item) throw new Error('Item not found');

      // Check if only one in qty
      if(item.qty === 1){
        // Remove item from cart
        cart.items = (cart.items as CartItem[]).filter(
          (i) => i.productId !== productId
        );
      }else{
        // Decrease the quantity
        (cart.items as CartItem[]).find(
          (i) => i.productId === productId
        )!.qty = item.qty - 1;
      }

      // Update cart in db
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrices(cart.items as CartItem[]),
        },
      });
     
      revalidatePath(`/product/${product.slug}`);

      return {
        success:true,
        message:`${item.name} was removed from cart`
      }
   

    }catch(error){
        return {
            success:false,
            message:formatErrors(error)
        }
    }
    
  }
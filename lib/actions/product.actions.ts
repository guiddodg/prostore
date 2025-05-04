'use server';
import { prisma   } from "@/db/prisma";
import { convertToPlainObject, formatErrors } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validator";
import { z } from "zod";

export async function getProductByID(productID: string){
    const product = await prisma.product.findUnique({
        where: {
            id: productID
        }
    });
    if (!product) throw new Error('Product not found');
    return product;
}

export async function getProductByIdPlainObject(productID: string){
    const product = await getProductByID(productID);
    return convertToPlainObject(product);
}

export async function getLatestProducts() {
    const data = await prisma.product.findMany({
       take: LATEST_PRODUCTS_LIMIT,
       orderBy: {
        createdAt: 'desc'
       }
    });
    return convertToPlainObject(data);
}

// Get single product by it's slug
export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
      where: {
        slug
      }
    });
}

export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query?: string;
  limit?: number;
  page: number;
  category?: string;  
}) {
    const data = await prisma.product.findMany({
      take: limit,
      skip:(page - 1) * limit,
    });
    const dataCount = await prisma.product.count();
    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    }
}

export async function deleteProduct(id: string) {
  try{
    const product = await getProductByID(id);
    await prisma.product.delete({
      where: {
        id: product.id
      }
    });
    revalidatePath('/admin/products');
    return {
      success : true,
      message: 'Product deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      message:formatErrors(error),
    };
  }
}

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({data:product});
    revalidatePath('/admin/products');
    return {
      success: true,
      message: 'Product created successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    await getProductByID(product.id);

    await prisma.product.update({
      where: {id: product.id},
      data: product,
    });
    revalidatePath('/admin/products');
    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}
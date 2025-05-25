'use server';
import { prisma   } from "@/db/prisma";
import { convertToPlainObject, formatErrors } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validator";
import { z } from "zod";
import { Prisma } from "@prisma/client";

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
  price,
  rating,
  sort,
}: {
  query?: string;
  limit?: number;
  page: number;
  category?: string; 
  price?: string;
  rating?: string;
  sort?: string; 
}) {
  const queryFilter: Prisma.ProductWhereInput = 
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        } as Prisma.StringFilter
      : {};

  const categoryFilter: Prisma.ProductWhereInput =
  category && category !== 'all'
    ? {
        category: {
          contains: category,
          mode: 'insensitive',
        },
      } as Prisma.StringFilter
    : {};
  const priceFilter: Prisma.ProductWhereInput =
  price && price !== 'all'
    ? {
        price: {
          gte: Number(price.split('-')[0]),
          lte: Number(price.split('-')[1]),
        },
      } 
    : {};

  const ratingFilter: Prisma.ProductWhereInput =
  rating && rating !== 'all'
    ? {
        rating: {
          gte: Number(rating),
        },
      } 
    : {};

  const data = await prisma.product.findMany({
    take: limit,
    skip:(page - 1) * limit,
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
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

export async function getProductCategories() {
  const categories = await prisma.product.groupBy({
    by: ['category'],
    _count: {
      category: true,
    },
  });
  return categories;
}

export async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 4,
  });
  return convertToPlainObject(products);
}
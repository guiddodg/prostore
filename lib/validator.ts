import {z} from 'zod';
import { formatNumberWithDecimalPlaces } from './utils';

const currency = z
.string()
.refine((value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimalPlaces(Number(value))),'Price must have exactly two decimal places')

export const insertProductSchema = z.object({
    name: z.string().min(3, {message: 'Name must be at least 3 characters'}),
    slug: z.string().min(3, {message: 'Slug  must be at least 3 characters'}),
    description: z.string().min(3, {message: 'Description must be at least 3 characters'}),
    category: z.string().min(3, {message: 'Category must be at least 3 characters'}),
    brand: z.string().min(3, {message: 'Brand must be at least 3 characters'}),
    stock: z.coerce.number(),
    images: z.array(z.string()).min(1,"At least one image is required"),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency

})

// Schema for signing user in
export const signInFromSChema = z.object({
    email: z.string().email('invalid email addess'),
    password: z.string().min(6,'Password must be at least 6 characters')
})

// Schema for signing up a user 
export const signUpFromSChema = z.object({
    name: z.string().min(3, {message: 'Name must be at least 3 characters'}),
    email: z.string().email('invalid email addess'),
    password: z.string().min(6,'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6,'Confirm Password must be at least 6 characters')
}).refine(({password,confirmPassword})=> password === confirmPassword, {
    message:'Passwords do not match',
    path: ['confirmPassword']
});

// Cart Schemas
export const cartItemSchema = z.object({
    productId: z.string().min(1, 'Product is required'),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    qty: z.number().int().nonnegative('Quantity must be a positive number'),
    image: z.string().min(1, 'Image is required'),
    price: currency,
});

export const insertCartSchema = z.object({
    items: z.array(cartItemSchema),
    itemsPrice: currency,
    totalPrice: currency,
    shippingPrice:currency,
    taxPrice:currency,
    sessionCartId: z.string().min(1, 'Session Cart Id is required'),
    userId: z.string().optional().nullable(),
})

export const shippingAddressSchema = z.object({
    fullname: z.string().min(3, 'Name must be at least 3 characters'),
    streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
    city: z.string().min(3, 'City must be at least 3 characters'),
    postalCode: z.string().min(3, 'Postal Code must be at least 3 characters'),
    country: z.string().min(3, 'Country must be at least 3 characters'),
    lat: z.number().optional(),
    lng: z.number().optional(),
});
import {z} from 'zod';
import { formatNumberWithDecimalPlaces } from './utils';
import { PAYMENT_METHODS } from './constants';

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

export const updateProductSchema =insertProductSchema.extend({
    id: z.string().min(1, {message: 'Product Id is required'}),
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

export const paymentMethodSchema = z.object({
    type: z.string().min(1, 'Payment method is required'),
}).refine((data) => PAYMENT_METHODS.includes(data.type), {
    message: 'Invalid payment method',
    path: ['type'],
});

export const insertOrderSchema = z.object({
    userId: z.string().min(1, 'User Id is required'),
    itemsPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    totalPrice: currency,
    shippingAddress: shippingAddressSchema,
    //paymentMethod: paymentMethodSchema,
    paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
        message: 'Invalid payment method',
    }),
});

export const insertOrderItemSchema = z.object({
    productId: z.string().min(1, 'Product Id is required'),
    slug: z.string().min(1, 'Slug is required'),
    image: z.string().min(1, 'Image is required'),
    name: z.string().min(1, 'Name is required'),
    price: currency,
    qty: z.number().int().nonnegative('Quantity must be a positive number'),
});

export const paymentResultSchema = z.object({
    id: z.string(),
    status: z.string(),
    email_address: z.string(),
    pricePaid: z.string(),
});

// Schema for updating the user profile
export const updateProfileSchema = z.object({
    name: z.string().min(3, {message: 'Name must be at least 3 characters'}),
    email: z.string().email('invalid email addess'),
});

export const updateUserSchema = updateProfileSchema.extend({
    id: z.string().min(1, {message: 'User Id is required'}),
    role: z.string(),
});
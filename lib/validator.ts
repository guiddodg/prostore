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
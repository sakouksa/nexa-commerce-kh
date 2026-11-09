import { z } from 'zod';

/**
 * Product Form Validation Schema
 */
export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Product name must be at least 2 characters.' })
      .max(120, { message: 'Product name cannot exceed 120 characters.' }),
    description: z
      .string()
      .max(2000, { message: 'Description cannot exceed 2000 characters.' })
      .optional()
      .default(''),
    price: z.coerce
      .number({ invalid_type_error: 'Price must be a valid number.' })
      .min(0, { message: 'Price cannot be negative.' }),
    sale_price: z.union([
      z.coerce.number().min(0, { message: 'Sale price cannot be negative.' }),
      z.literal(''),
      z.null(),
      z.undefined(),
    ]).optional(),
    quantity: z.coerce
      .number({ invalid_type_error: 'Quantity must be a valid integer.' })
      .int({ message: 'Quantity must be a whole number.' })
      .min(0, { message: 'Quantity cannot be negative.' })
      .default(0),
    category_id: z.string().optional().default(''),
    featured: z.boolean().default(false),
    status: z.enum(['active', 'hidden']).default('active'),
  })
  .refine(
    (data) => {
      if (
        data.sale_price !== '' &&
        data.sale_price !== null &&
        data.sale_price !== undefined
      ) {
        return Number(data.sale_price) < Number(data.price);
      }
      return true;
    },
    {
      message: 'Sale price must be less than the regular price.',
      path: ['sale_price'],
    }
  );

export type ProductFormValues = z.infer<typeof productSchema>;

/**
 * Category Validation Schema
 */
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Category name must be at least 2 characters.' })
    .max(50, { message: 'Category name cannot exceed 50 characters.' }),
  slug: z
    .string()
    .trim()
    .max(60, { message: 'Slug cannot exceed 60 characters.' })
    .optional()
    .default(''),
  sort_order: z.coerce
    .number()
    .int()
    .min(0, { message: 'Sort order must be 0 or greater.' })
    .default(0),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: 'Username or email must be at least 3 characters.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Profile Information Validation Schema
 */
export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(80, { message: 'Full name cannot exceed 80 characters.' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address.' }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, { message: 'Please enter a valid phone number.' })
    .or(z.literal(''))
    .optional(),
  bio: z
    .string()
    .max(500, { message: 'Bio cannot exceed 500 characters.' })
    .optional()
    .default(''),
  language: z.string().default('en'),
  city: z.string().optional().default('Phnom Penh'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * Change Password Validation Schema
 */
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: 'Current password is required.' }),
    new_password: z
      .string()
      .min(6, { message: 'New password must be at least 6 characters.' }),
    confirm_password: z
      .string()
      .min(1, { message: 'Please confirm your new password.' }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'New passwords do not match.',
    path: ['confirm_password'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

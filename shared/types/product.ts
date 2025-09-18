/**
 * Product shape stored in DynamoDB
 * Shared across all applications
 */
export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    inStock: boolean;
    description?: string;
    imageUrl?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Type for creating a new product (excludes auto-generated fields)
 */
export type CreateProductData = Omit<Product, "id" | "createdAt" | "updatedAt">;

/**
 * Type for updating a product (partial fields, excludes auto-generated fields)
 */
export type UpdateProductData = Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>;
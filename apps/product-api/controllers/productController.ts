import { APIGatewayProxyHandler } from "aws-lambda";
import {
    createProduct,
    getProductById,
    listProducts,
    updateProduct,
    deleteProduct,
} from "../services/productService";
import * as yup from "yup";

// Define Yup schemas
const createProductSchema = yup.object({
    name: yup.string().required("Name is required"),
    category: yup.string().required("Category is required"),
    price: yup.number()
        .typeError("Price must be a number")
        .min(0, "Price cannot be negative")
        .required("Price is required"),
    quantity: yup.number()
        .typeError("Quantity must be an integer")
        .integer("Quantity must be an integer")
        .min(0, "Quantity cannot be negative")
        .required("Quantity is required"),
    inStock: yup.boolean().required("inStock flag is required"),
    description: yup.string().notRequired(),
    imageUrl: yup.string().url("imageUrl must be a valid URL").notRequired(),
    tags: yup.array().of(yup.string()).notRequired(),
}).noUnknown(true, "Unexpected field found");

const idParamSchema = yup.object({
    id: yup.string()
        .uuid("Invalid product ID format")
        .required("Product ID is required"),
});

// Handler to create a new product with Yup validation
export const createProductHandler: APIGatewayProxyHandler = async (event) => {
    try {
        const data = JSON.parse(event.body || "{}");
        await createProductSchema.validate(data, { abortEarly: false });

        const newProduct = await createProduct(data);
        return {
            statusCode: 201,
            body: JSON.stringify(newProduct),
        };
    } catch (err: any) {
        console.error("createProduct validation error", err);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid request",
                errors: err.errors || [err.message],
            }),
        };
    }
};

// Handler to fetch a single product by ID with Yup validation
export const getProductHandler: APIGatewayProxyHandler = async (event) => {
    try {
        const params = { id: event.pathParameters?.id };
        await idParamSchema.validate(params, { abortEarly: false });

        const product = await getProductById(params.id!);
        if (!product) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(product),
        };
    } catch (err: any) {
        console.error("getProduct validation error", err);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid request parameter",
                errors: err.errors || [err.message],
            }),
        };
    }
};

// Handler to list all products (no validation needed)
export const listProductsHandler: APIGatewayProxyHandler = async () => {
    try {
        const products = await listProducts();
        return {
            statusCode: 200,
            body: JSON.stringify(products),
        };
    } catch (error) {
        console.error("listProducts error", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};

// Handler to update an existing product with Yup validation
export const updateProductHandler: APIGatewayProxyHandler = async (event) => {
    try {
        const params = { id: event.pathParameters?.id };
        await idParamSchema.validate(params, { abortEarly: false });

        const updates = JSON.parse(event.body || "{}");
        await createProductSchema.validate(updates, { abortEarly: false });

        const updated = await updateProduct(params.id!, updates);
        return {
            statusCode: 200,
            body: JSON.stringify(updated),
        };
    } catch (err: any) {
        console.error("updateProduct validation error", err);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid request",
                errors: err.errors || [err.message],
            }),
        };
    }
};

// Handler to delete a product by ID with Yup validation
export const deleteProductHandler: APIGatewayProxyHandler = async (event) => {
    try {
        const params = { id: event.pathParameters?.id };
        await idParamSchema.validate(params, { abortEarly: false });

        await deleteProduct(params.id!);
        return {
            statusCode: 204,
            body: "",
        };
    } catch (err: any) {
        console.error("deleteProduct validation error", err);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid request parameter",
                errors: err.errors || [err.message],
            }),
        };
    }
};

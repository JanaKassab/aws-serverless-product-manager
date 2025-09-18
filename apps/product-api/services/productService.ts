import {
    PutCommand,
    GetCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Product, CreateProductData, UpdateProductData } from "../../shared/types";
import { ddbDocClient, TABLE_NAME } from "../../shared/utils";

/**
 * Create a new product
 */
export async function createProduct(
    data: CreateProductData
): Promise<Product> {
    const now = new Date().toISOString();
    const item: Product = {
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
        ...data
    };

    await ddbDocClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        })
    );

    return item;
}

/**
 * Retrieve a product by its ID
 */
export async function getProductById(id: string): Promise<Product | null> {
    const result = await ddbDocClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        })
    );

    return (result.Item as Product) || null;
}

/**
 * List all products (paginated keys can be added if needed)
 */
export async function listProducts(): Promise<Product[]> {
    const result = await ddbDocClient.send(
        new ScanCommand({
            TableName: TABLE_NAME
        })
    );

    return (result.Items as Product[]) || [];
}

/**
 * Update fields on an existing product
 */
export async function updateProduct(
    id: string,
    updates: UpdateProductData
): Promise<Product> {
    if (Object.keys(updates).length === 0) {
        throw new Error("No fields provided to update");
    }

    const now = new Date().toISOString();
    const exprAttrNames: Record<string, string> = {
        "#updatedAt": "updatedAt"
    };
    const exprAttrValues: Record<string, any> = {
        ":updatedAt": now
    };
    const setClauses = ["#updatedAt = :updatedAt"];

    let idx = 0;
    for (const [key, value] of Object.entries(updates)) {
        idx++;
        const nameKey = `#field${idx}`;
        const valueKey = `:value${idx}`;
        exprAttrNames[nameKey] = key;
        exprAttrValues[valueKey] = value;
        setClauses.push(`${nameKey} = ${valueKey}`);
    }

    const result = await ddbDocClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "SET " + setClauses.join(", "),
            ExpressionAttributeNames: exprAttrNames,
            ExpressionAttributeValues: exprAttrValues,
            ReturnValues: "ALL_NEW"
        })
    );

    return result.Attributes as Product;
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: string): Promise<void> {
    await ddbDocClient.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        })
    );
}

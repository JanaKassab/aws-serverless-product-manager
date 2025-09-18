import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Shared DynamoDB client configuration
 * Used across all applications
 */

// Initialize DynamoDB Document client
export const ddbClient = new DynamoDBClient({});
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Shared table name configuration
 */
export const TABLE_NAME = "http-crud-tutorial-items";
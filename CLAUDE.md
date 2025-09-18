# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This repository contains two serverless applications organized in a monorepo structure:

### apps/product-api (formerly my-crud-serverless)
A CRUD API for products using AWS Lambda, API Gateway, and DynamoDB:
- **Controllers**: `controllers/productController.ts` - HTTP handlers for CRUD operations
- **Services**: `services/productService.ts` - DynamoDB operations using shared types
- **Routes**: `routes.yml` - HTTP API route definitions (imported by serverless.yml)
- **Configuration**: `serverless.yml` - Main Serverless Framework configuration

### apps/data-importer (formerly my-scheduled-serverless/MyScheduledEvent)
A scheduled Lambda function for importing data from S3 to DynamoDB:
- **Handler**: `handler.ts` - Entry point that exports importItems function
- **Controllers**: `controllers/productController.ts` - Scheduled import logic
- **Services**: `services/productService.ts` - S3 and DynamoDB operations using shared types
- **Configuration**: `serverless.yml` - Scheduled event configuration (daily at 8 AM Beirut time)

### shared/
Common code shared between applications:
- **Types**: `shared/types/product.ts` - Product interface and type definitions
- **Utils**: `shared/utils/dynamodb-client.ts` - Shared DynamoDB client configuration

## Development Commands

Each application has its own serverless configuration. Navigate to the specific app directory before running commands:

### Deployment
```bash
cd apps/product-api     # or apps/data-importer
serverless deploy
```

### Local Development
```bash
cd apps/product-api     # or apps/data-importer
serverless dev          # Start local emulator with cloud tunneling
serverless offline      # Run locally with serverless-offline plugin
```

### DynamoDB Local
Both applications use `serverless-dynamodb-local` plugin for local DynamoDB development.

## Architecture Notes

- **Runtime**: Node.js 20.x on AWS Lambda
- **Database**: DynamoDB with table name "http-crud-tutorial-items"
- **Validation**: Yup schemas for request validation in CRUD API
- **TypeScript**: Both applications use TypeScript with @types/node
- **AWS SDK**: v3 SDK for DynamoDB operations (@aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb)
- **Package Strategy**: Individual packaging enabled for optimized Lambda bundles
- **Shared Code**: Common types and utilities are imported from `../../shared/`

## Key Dependencies

- **AWS SDK v3**: DynamoDB client and document client
- **Yup**: Schema validation for API requests (product-api only)
- **UUID**: ID generation for products
- **csv-parser**: CSV parsing in scheduled function (data-importer only)
- **aws-lambda**: Type definitions for Lambda handlers

## Shared Types and Utilities

- **Product Interface**: Defined in `shared/types/product.ts` with related types
- **DynamoDB Client**: Shared client configuration in `shared/utils/dynamodb-client.ts`
- **Import Strategy**: Both applications import from `../../shared/types` and `../../shared/utils`

## DynamoDB Schema

Products table with:
- **id**: UUID primary key
- **name, category, price, quantity, inStock**: Required fields
- **description, imageUrl, tags**: Optional fields
- **createdAt, updatedAt**: Timestamp fields

## IAM Permissions

Applications require DynamoDB permissions (Query, Scan, GetItem, PutItem, UpdateItem, DeleteItem) and S3 GetObject for the scheduled function.
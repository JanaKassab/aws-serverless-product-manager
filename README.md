# Serverless Product Management Platform

A monorepo containing two serverless applications for product management using AWS Lambda, DynamoDB, and the Serverless Framework.

## 🏗️ Architecture

This project consists of two interconnected serverless applications:

- **Product API** - RESTful CRUD API for product management
- **Data Importer** - Scheduled service for importing products from S3 to DynamoDB

Both applications share common types and utilities, ensuring consistency and reducing code duplication.

## 📁 Project Structure

```
serverless-product-management/
├── apps/
│   ├── product-api/          # REST API for product CRUD operations
│   │   ├── controllers/      # HTTP request handlers
│   │   ├── services/         # Business logic and DynamoDB operations
│   │   ├── routes.yml        # API route definitions
│   │   └── serverless.yml    # API deployment configuration
│   └── data-importer/        # Scheduled CSV import service
│       ├── controllers/      # Import logic handlers
│       ├── services/         # S3 and DynamoDB operations
│       ├── handler.ts        # Lambda entry point
│       └── serverless.yml    # Scheduler deployment configuration
├── shared/
│   ├── types/               # Common TypeScript interfaces
│   │   └── product.ts       # Product data models
│   └── utils/               # Shared utilities
│       └── dynamodb-client.ts  # DynamoDB client configuration
├── README.md
└── CLAUDE.md               # Development guidance
```

## 🚀 Features

### Product API (`apps/product-api`)
- ✅ Create new products with validation
- ✅ Retrieve products by ID
- ✅ List all products
- ✅ Update existing products
- ✅ Delete products
- ✅ Request validation using Yup schemas
- ✅ Comprehensive error handling

### Data Importer (`apps/data-importer`)
- ✅ Scheduled daily imports at 8 AM Beirut time using EventBridge Scheduler
- ✅ CSV parsing from S3 buckets with date-based folder structure
- ✅ Batch processing to DynamoDB
- ✅ Automatic UUID generation for imported items
- ✅ Direct EventBridge trigger (no API Gateway)

## 📅 Daily Import Process

The data importer follows this automated workflow:

1. **Daily Schedule**: EventBridge Scheduler triggers the Lambda function every day at 8:00 AM Beirut time
2. **Date-based File Structure**: The system expects CSV files to be uploaded to S3 under folders named with the current date (YYYY-MM-DD format)
3. **File Processing**: Lambda function reads the CSV file from `s3://bucket-name/YYYY-MM-DD/items.csv`
4. **Data Parsing**: CSV contains items with columns: `name`, `description`, `price`
5. **Database Storage**: Each parsed item is stored in DynamoDB with auto-generated UUID and timestamps

### Expected S3 Structure
```
s3://import-s3-to-ddb-dev-data/
├── 2024-01-15/
│   └── items.csv
├── 2024-01-16/
│   └── items.csv
└── 2024-01-17/
    └── items.csv
```

### CSV File Format
```csv
name,description,price
"Product A","Description of Product A",19.99
"Product B","Description of Product B",29.99
"Product C","Description of Product C",9.99
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 20.x
- **Framework**: Serverless Framework v4
- **Database**: AWS DynamoDB
- **Storage**: AWS S3 (for CSV imports)
- **Scheduler**: AWS EventBridge Scheduler
- **API Gateway**: AWS HTTP API (Product API only)
- **Language**: TypeScript
- **Validation**: Yup (API only)
- **CSV Processing**: csv-parser
- **AWS SDK**: v3

## 📋 Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started)
- [AWS CLI configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
- AWS account with appropriate permissions

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd serverless-product-management
   ```

2. **Install dependencies for both applications**
   ```bash
   # Install Product API dependencies
   cd apps/product-api
   npm install
   
   # Install Data Importer dependencies
   cd ../data-importer
   npm install
   ```

## 🚀 Deployment

### Deploy Product API
```bash
cd apps/product-api
serverless deploy
```

### Deploy Data Importer
```bash
cd apps/data-importer
serverless deploy
```

### Deploy All (from root)
```bash
# Deploy both applications
cd apps/product-api && serverless deploy && cd ../data-importer && serverless deploy
```

## 🧪 Local Development

### Product API Development
```bash
cd apps/product-api

# Start local development server
serverless dev

# Or use offline mode
serverless offline
```

### Data Importer Development
```bash
cd apps/data-importer

# Start local development server
serverless dev

# Test the import function locally
serverless invoke local -f importItems
```

### DynamoDB Local
Both applications support local DynamoDB development:
```bash
# Start local DynamoDB (in either app directory)
serverless dynamodb start
```

## 🔗 API Endpoints

After deployment, the Product API provides these endpoints:

- `POST /products` - Create a new product
- `GET /products/{id}` - Get a product by ID
- `GET /products` - List all products
- `PATCH /products/{id}` - Update a product
- `DELETE /products/{id}` - Delete a product

## 📊 Data Schema

### Product Model
```typescript
interface Product {
  id: string;           // UUID primary key
  name: string;         // Product name
  category: string;     // Product category
  price: number;        // Product price
  quantity: number;     // Stock quantity
  inStock: boolean;     // Availability flag
  description?: string; // Optional description
  imageUrl?: string;    // Optional image URL
  tags?: string[];      // Optional tags array
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

### Import Item Model (CSV)
```typescript
interface Item {
  id: string;        // Auto-generated UUID
  name: string;      // From CSV
  description: string; // From CSV
  price: number;     // From CSV (parsed as float)
  createdAt: string; // Auto-generated timestamp
  updatedAt: string; // Auto-generated timestamp
}
```

## 🔐 Required AWS Permissions

### Product API
```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:Query",
    "dynamodb:Scan",
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem",
    "dynamodb:DeleteItem"
  ],
  "Resource": "arn:aws:dynamodb:*:*:table/http-crud-tutorial-items"
}
```

### Data Importer
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "dynamodb:PutItem"
  ],
  "Resource": [
    "arn:aws:s3:::import-s3-to-ddb-dev-data/*",
    "arn:aws:dynamodb:*:*:table/http-crud-tutorial-items"
  ]
}
```

## 🌍 Environment Variables

### Product API
- `PRODUCTS_TABLE`: DynamoDB table name (default: `http-crud-tutorial-items`)

### Data Importer
- `TABLE_NAME`: DynamoDB table name (default: `http-crud-tutorial-items`)
- `S3_BUCKET`: S3 bucket for CSV imports (default: `import-s3-to-ddb-dev-data`)

## ⏰ Scheduler Configuration

The data importer uses EventBridge Scheduler with the following configuration:
- **Schedule**: Daily at 8:00 AM Beirut time
- **Cron Expression**: `cron(0 8 * * ? *)`
- **Timezone**: `Asia/Beirut`
- **Target**: Lambda function (direct invocation, no API Gateway)

## 📈 Monitoring & Logs

View logs for deployed functions:
```bash
# Product API logs
cd apps/product-api
serverless logs -f createProduct --tail

# Data Importer logs
cd apps/data-importer
serverless logs -f importItems --tail
```

## 🚨 Error Handling

The data importer includes comprehensive error handling:
- Missing S3 files for the current date
- CSV parsing errors
- DynamoDB write failures
- Invalid data format validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:
- Check the [CLAUDE.md](CLAUDE.md) file for development guidance
- Open an issue in the GitHub repository
- Review the [Serverless Framework documentation](https://www.serverless.com/framework/docs/)

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [EventBridge Scheduler Documentation](https://docs.aws.amazon.com/scheduler/)
- [Serverless Framework Plugins](https://www.serverless.com/plugins/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
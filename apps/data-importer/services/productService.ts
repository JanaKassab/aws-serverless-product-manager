import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import csvParser from "csv-parser";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { Product } from "../../shared/types";
import { ddbDocClient, TABLE_NAME } from "../../shared/utils";

const BUCKET_NAME = "import-s3-to-ddb-dev-data";
if (!BUCKET_NAME) {
    throw new Error("Environment variable S3_BUCKET must be set");
}

const s3 = new S3Client({});

export interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    createdAt: string;
    updatedAt: string;
}

export class ImportService {
    async importForDate(date: string): Promise<number> {
        const key = `${date}/items.csv`;
        const { Body } = await s3.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        }));
        if (!Body) {
            throw new Error(`No object found at s3://${BUCKET_NAME}/${key}`);
        }

        // parse CSV into Item[]
        const items = await this.parseCsv(Body as Readable);

        // write all to DynamoDB in parallel
        await Promise.all(
            items.map(item =>
                ddbDocClient.send(new PutCommand({
                    TableName: TABLE_NAME,
                    Item: item
                }))
            )
        );

        return items.length;
    }

    private parseCsv(stream: Readable): Promise<Item[]> {
        return new Promise((resolve, reject) => {
            const results: Item[] = [];
            const now = new Date().toISOString();

            stream
                .pipe(csvParser())
                .on("data", (row: any) => {
                    results.push({
                        id: uuidv4(),            // generate the missing key
                        name: row.name,
                        description: row.description,
                        price: parseFloat(row.price),
                        createdAt: now,
                        updatedAt: now,
                    });
                })
                .on("end", () => resolve(results))
                .on("error", reject);
        });
    }
}

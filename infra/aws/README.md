# AWS Builder path

Same detection + action brain as local demo. Judges should use **fixture mode** (`npm run demo`) without AWS credentials.

## Flow

1. **API Gateway** `POST /events` — accept normalized Ring-like events  
2. **Lambda** [`handler.mjs`](./handler.mjs) — `detectDeliveries` + `recommendActions`  
3. **DynamoDB** (template) — store event summaries  
4. **S3** (template) — daily privacy-safe JSON summaries  
5. **EventBridge (optional)** — evening digest  

## Handler (local smoke)

```bash
node infra/aws/handler.mjs
```

Or invoke the export:

```js
import { handler } from "./infra/aws/handler.mjs";
await handler({ body: { events: [...] } });
```

## Deploy (optional — October polish)

1. Package `handler.mjs` + `services/` into a Lambda zip (Node 20)  
2. Create API Gateway HTTP API → Lambda integration on `POST /events`  
3. Deploy CloudFormation stub: `aws cloudformation deploy --template-file infra/aws/template.yaml --stack-name pps-mvp`  
4. Point ingest at the table/bucket names from stack outputs  

## Suggested resources

| Resource | Name (demo) | Notes |
|----------|-------------|-------|
| DynamoDB | `pps-events` | PK=`deviceId`, SK=`occurredAt` |
| DynamoDB | `pps-detections` | PK=`detectionId` |
| S3 | `pps-summaries-<account>` | `summaries/YYYY-MM-DD.json` |
| IAM | least privilege for Lambdas | no S3 public ACL |

## Privacy

Handler response documents `storedFields` vs `notStored` (no raw video / audio / faces).

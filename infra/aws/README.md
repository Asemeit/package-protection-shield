# AWS Builder path (stubs)

This folder sketches the AWS Builder mini-challenge wiring. Implement with SAM/CDK when ready.

## Flow

1. **API Gateway** `POST /events` — accept normalized Ring-like events
2. **Lambda `ingest`** — validate schema, write to DynamoDB
3. **Lambda `detect`** — run `services/detect` heuristics, write detections
4. **Lambda `actions`** — attach next-best-action recommendations
5. **S3** — daily JSON summaries (privacy-safe, no media)
6. **EventBridge (optional)** — schedule evening digest

## Suggested resources

| Resource | Name (demo) | Notes |
|----------|-------------|-------|
| DynamoDB | `pps-events` | PK=`deviceId`, SK=`occurredAt` |
| DynamoDB | `pps-detections` | PK=`detectionId` |
| S3 | `pps-summaries-<account>` | `summaries/YYYY-MM-DD.json` |
| IAM | least privilege for Lambdas | no S3 public ACL |

## Local first

Keep fixture mode (`FIXTURE_MODE=true`) as the default demo path so judges can run without AWS credentials.

# Architecture — Package Protection Shield

Companion to [REQUIREMENTS.md](./REQUIREMENTS.md) and [LEARN.md](./LEARN.md).

---

## 1. Context diagram

```mermaid
flowchart LR
  subgraph Sources
    R[Ring / Simulator]
    F[Fixture JSON]
  end

  subgraph PPS["Package Protection Shield"]
    I[Event ingest / normalize]
    D[Detection service]
    A[Action engine]
    U[Web timeline UI]
  end

  subgraph Store["Privacy-safe store"]
    DB[(Events / detections / actions)]
    S3[(Daily summaries)]
  end

  R --> I
  F --> I
  I --> D
  D --> A
  A --> U
  I --> DB
  D --> DB
  A --> DB
  D --> S3
```

**Idea:** same brain (detect + actions) whether events come from fixtures or Ring.

---

## 2. Sequence — delivery → action

```mermaid
sequenceDiagram
  participant Fix as Fixtures / Ring
  participant API as demo.mjs / API
  participant Det as detectDeliveries
  participant Act as recommendAction
  participant UI as Web UI

  Fix->>API: events[]
  API->>Det: events[]
  Det-->>API: detections[]
  API->>Act: detections[]
  Act-->>API: actions[]
  UI->>API: GET /api/timeline
  API-->>UI: events, detections, actions, privacy
  UI->>API: POST /api/actions/apply
  API-->>UI: applied entry
```

---

## 3. Domain model (MVP)

```mermaid
classDiagram
  class RingEvent {
    id
    deviceId
    deviceName
    type
    occurredAt
    durationSec
    zone
  }
  class DeliveryDetection {
    id
    deviceId
    startedAt
    endedAt
    confidence
    label
    reasonCodes
    eventIds
  }
  class RecommendedAction {
    id
    detectionId
    kind
    title
    rationale
    durationMinutes
  }
  RingEvent "many" --> "0..1" DeliveryDetection : clustered into
  DeliveryDetection "1" --> "1" RecommendedAction : recommends
```

---

## 4. Logical vs physical (local vs AWS)

| Logical piece | Local MVP | AWS Builder target |
|---------------|-----------|--------------------|
| Ingest | `scripts/demo.mjs` + fixtures | API Gateway + Lambda |
| Detect | `services/detect` | Lambda (same module) |
| Actions | `services/actions` | Lambda or inline |
| Timeline UI | `apps/web` | S3/CloudFront or same local UI hitting API |
| Event store | in-memory session | DynamoDB |
| Summaries | optional / derived | S3 JSON objects |

```mermaid
flowchart TB
  subgraph Local
    L1[fixtures] --> L2[demo.mjs]
    L2 --> L3[detect + actions]
    L3 --> L4[apps/web]
  end

  subgraph AWS
    A1[Ring adapter] --> A2[API GW]
    A2 --> A3[Lambda ingest]
    A3 --> A4[DynamoDB]
    A3 --> A5[Lambda detect/actions]
    A5 --> A4
    A5 --> A6[S3 summaries]
    A7[Web UI] --> A2
  end
```

Keep **detect/actions as pure functions** so local and AWS stay aligned.

---

## 5. Privacy data flow

```mermaid
flowchart LR
  E[Raw camera media] -. never ingested .-> X[Not in system]
  V[Ring events metadata] --> N[Normalize]
  N --> D[Detect]
  D --> S[Store: time, device, type, label, confidence, action]
```

UI must surface the stored-field list when privacy mode is on.

---

## 6. Component ownership

| Component | Responsibility | Not responsible for |
|-----------|----------------|---------------------|
| `detect.mjs` | Delivery heuristics | UI, AWS, Ring OAuth |
| `actions.mjs` | Next-best action rules | Persistence |
| `demo.mjs` | HTTP + wiring | Business rules |
| `apps/web` | Presentation + Apply UX | Scoring |
| `infra/aws` | Cloud resources | Product heuristics |

---

## 7. Extension points (post-MVP)

- Ring adapter implementing “fetch events → `RingEvent[]`”
- Feedback API: `was_delivery: true|false`
- Device role config: `porch` vs `driveway`
- Deep-link mapper: action kind → Ring settings URL

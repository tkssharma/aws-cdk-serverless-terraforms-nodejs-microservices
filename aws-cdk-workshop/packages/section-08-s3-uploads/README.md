# SECTION 8 – File Uploads with S3

---

## Lecture 15: S3 Fundamentals for Serverless Apps

### S3 Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                        S3 BUCKET                             │
│  bucket-name-unique-globally                                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  uploads/                                            │   │
│  │    ├── user-123/                                     │   │
│  │    │   ├── profile.jpg      (Object)                 │   │
│  │    │   └── documents/                                │   │
│  │    │       └── resume.pdf   (Object)                 │   │
│  │    └── user-456/                                     │   │
│  │        └── avatar.png       (Object)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Public vs Private Access

| Access Type | Use Case         | Security            |
| ----------- | ---------------- | ------------------- |
| Private     | Default, secure  | IAM/Pre-signed URLs |
| Public Read | Static websites  | Open to internet    |
| Pre-signed  | Temporary access | Time-limited URLs   |

### Pre-signed URLs Flow

```
┌────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client │────▶│  API    │────▶│ Lambda  │────▶│   S3    │
│        │     │         │     │         │     │         │
│        │     │ POST    │     │ Generate│     │         │
│        │     │/presign │     │ URL     │     │         │
└────────┘     └────┬────┘     └─────────┘     └─────────┘
    │               │
    │  ◀────────────┘  (returns pre-signed URL)
    │
    │  Direct upload to S3 using pre-signed URL
    └────────────────────────────────────────────▶ S3
```

---

## Lecture 16: S3 + Lambda + API Gateway

### Create Bucket

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

const uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
  bucketName: `uploads-${stage}-${this.account}`,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,

  // CORS for browser uploads
  cors: [
    {
      allowedMethods: [
        s3.HttpMethods.GET,
        s3.HttpMethods.PUT,
        s3.HttpMethods.POST,
      ],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
      maxAge: 3000,
    },
  ],

  // Security
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  encryption: s3.BucketEncryption.S3_MANAGED,

  // Lifecycle rules
  lifecycleRules: [
    {
      id: 'delete-old-uploads',
      prefix: 'temp/',
      expiration: cdk.Duration.days(7),
    },
  ],
});
```

### Grant Lambda Access

```typescript
uploadsBucket.grantReadWrite(lambda);

// Pass bucket name to Lambda
environment: {
  UPLOADS_BUCKET: uploadsBucket.bucketName,
}
```

---

## 8.3 S3 Operations in Node.js

### Setup Client

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({});
const BUCKET = process.env.UPLOADS_BUCKET;
```

### Generate Upload URL

```typescript
async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  return signedUrl;
}
```

### Generate Download URL

```typescript
async function getDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  return signedUrl;
}
```

### Express Routes

```typescript
// POST /uploads/presigned-url
router.post('/presigned-url', async (req, res) => {
  const { filename, contentType } = req.body;
  const key = `uploads/${Date.now()}-${filename}`;

  const uploadUrl = await getUploadUrl(key, contentType);

  res.json({ uploadUrl, key, expiresIn: 3600 });
});

// GET /uploads/:key/download
router.get('/:key/download', async (req, res) => {
  const downloadUrl = await getDownloadUrl(req.params.key);
  res.json({ downloadUrl });
});
```

---

## 8.4 Frontend Upload

```javascript
// 1. Get pre-signed URL from API
const response = await fetch('/api/uploads/presigned-url', {
  method: 'POST',
  body: JSON.stringify({ filename: file.name, contentType: file.type }),
});
const { uploadUrl } = await response.json();

// 2. Upload directly to S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
});
```

---

## Hands-On Lab 8.1

See `demo/` folder for S3 upload example.

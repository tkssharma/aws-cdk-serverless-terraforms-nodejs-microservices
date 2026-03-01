import { Router, Request, Response } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const router = Router();

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.UPLOADS_BUCKET || 'uploads-bucket';

// GET /uploads - List all uploads
router.get('/', async (req: Request, res: Response) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 100
    });
    
    const result = await s3Client.send(command);
    
    const files = (result.Contents || []).map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified
    }));
    
    res.json({ files, count: files.length });
  } catch (error: any) {
    console.error('Error listing uploads:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /uploads/presigned-url - Get presigned URL for upload
router.post('/presigned-url', async (req: Request, res: Response) => {
  try {
    const { filename, contentType } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    const key = `uploads/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'application/octet-stream'
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    res.json({
      uploadUrl: signedUrl,
      key,
      expiresIn: 3600
    });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /uploads/:key/download - Get presigned URL for download
router.get('/:key/download', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: decodeURIComponent(key)
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    res.json({
      downloadUrl: signedUrl,
      key,
      expiresIn: 3600
    });
  } catch (error: any) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as uploadsRouter };

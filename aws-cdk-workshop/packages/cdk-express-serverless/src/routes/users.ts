import { Router, Request, Response } from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  ScanCommand, 
  DeleteCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.USERS_TABLE || 'users-table';

interface User {
  user_id: string;
  email: string;
  name: string;
  created_at: number;
  updated_at: number;
}

// GET /users - List all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      Limit: 100
    });
    
    const result = await docClient.send(command);
    res.json({
      users: result.Items || [],
      count: result.Count
    });
  } catch (error: any) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { user_id: id }
    });
    
    const result = await docClient.send(command);
    
    if (!result.Item) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.Item);
  } catch (error: any) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /users - Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }
    
    const now = Date.now();
    const user: User = {
      user_id: uuidv4(),
      email,
      name,
      created_at: now,
      updated_at: now
    };
    
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: user
    });
    
    await docClient.send(command);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /users/:id - Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;
    
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { user_id: id },
      UpdateExpression: 'SET #name = :name, #email = :email, #updated_at = :updated_at',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#email': 'email',
        '#updated_at': 'updated_at'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':email': email,
        ':updated_at': Date.now()
      },
      ReturnValues: 'ALL_NEW'
    });
    
    const result = await docClient.send(command);
    res.json(result.Attributes);
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { user_id: id }
    });
    
    await docClient.send(command);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as usersRouter };

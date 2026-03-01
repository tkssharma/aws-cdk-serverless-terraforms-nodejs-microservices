# SECTION 7 – Authentication with Amazon Cognito

---

## Lecture 13: Cognito User Pool Deep Dive

### User Pool vs Identity Pool

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COGNITO                                      │
│                                                                      │
│  ┌─────────────────────────┐    ┌─────────────────────────┐        │
│  │      USER POOL          │    │     IDENTITY POOL       │        │
│  │                         │    │                         │        │
│  │  • User directory       │    │  • AWS credentials      │        │
│  │  • Sign-up/Sign-in      │    │  • Access AWS services  │        │
│  │  • JWT tokens           │    │  • Federated identities │        │
│  │  • MFA                  │    │  • Guest access         │        │
│  │  • Password policies    │    │                         │        │
│  └────────────┬────────────┘    └─────────────────────────┘        │
│               │                                                      │
│               ▼                                                      │
│  ┌─────────────────────────┐                                        │
│  │     JWT TOKENS          │                                        │
│  │  • ID Token             │  (User attributes)                     │
│  │  • Access Token         │  (API authorization)                   │
│  │  • Refresh Token        │  (Get new tokens)                      │
│  └─────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      JWT TOKEN                               │
│                                                              │
│  Header.Payload.Signature                                   │
│                                                              │
│  Header:   { "alg": "RS256", "typ": "JWT" }                │
│  Payload:  { "sub": "user-id", "email": "...", ... }       │
│  Signature: RSASHA256(header + payload, private_key)        │
└─────────────────────────────────────────────────────────────┘
```

### OAuth Flows

| Flow               | Use Case              |
| ------------------ | --------------------- |
| Authorization Code | Web apps with backend |
| Implicit           | SPAs (legacy, avoid)  |
| Client Credentials | Machine-to-machine    |
| Password           | Mobile apps (trusted) |

---

## Lecture 14: Cognito with API Gateway & Lambda

### Create User Pool

```typescript
import * as cognito from 'aws-cdk-lib/aws-cognito';

const userPool = new cognito.UserPool(this, 'UserPool', {
  userPoolName: `users-pool-${stage}`,
  selfSignUpEnabled: true,
  signInAliases: {
    email: true,
    username: true,
  },
  autoVerify: {
    email: true,
  },
  standardAttributes: {
    email: { required: true, mutable: true },
    fullname: { required: false, mutable: true },
  },
  customAttributes: {
    tenant_id: new cognito.StringAttribute({ mutable: false }),
    role: new cognito.StringAttribute({ mutable: true }),
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSymbols: false,
  },
  accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
});
```

### Create User Pool Client

```typescript
const userPoolClient = userPool.addClient('AppClient', {
  userPoolClientName: `app-client-${stage}`,
  authFlows: {
    userPassword: true,
    userSrp: true,
  },
  oAuth: {
    flows: {
      authorizationCodeGrant: true,
    },
    scopes: [
      cognito.OAuthScope.EMAIL,
      cognito.OAuthScope.OPENID,
      cognito.OAuthScope.PROFILE,
    ],
    callbackUrls: ['http://localhost:3000/callback'],
    logoutUrls: ['http://localhost:3000/logout'],
  },
  accessTokenValidity: cdk.Duration.hours(1),
  idTokenValidity: cdk.Duration.hours(1),
  refreshTokenValidity: cdk.Duration.days(30),
});
```

### API Gateway Authorizer

```typescript
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
  this,
  'CognitoAuthorizer',
  {
    cognitoUserPools: [userPool],
  },
);

// Protect API endpoint
api.root
  .addResource('protected')
  .addMethod('GET', new apigateway.LambdaIntegration(lambda), {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
  });
```

---

## 7.3 Auth Flow in Express

### Middleware

```typescript
export const authMiddleware = (req, res, next) => {
  const claims = req.requestContext?.authorizer?.claims;

  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = {
    sub: claims.sub,
    email: claims.email,
    role: claims['custom:role'],
  };

  next();
};
```

### Protected Routes

```typescript
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.email}` });
});
```

---

## 7.4 Frontend Auth Flow

```
┌────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client   │────▶│   Cognito   │────▶│  User Pool  │
│            │     │   Hosted UI │     │             │
└────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ JWT Tokens  │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ API Gateway │ (validates token)
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Lambda    │ (receives claims)
                   └─────────────┘
```

---

## Hands-On Lab 7.1

See `demo/` folder for Cognito authentication example.

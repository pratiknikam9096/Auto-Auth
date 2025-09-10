# Authentication SDK

## Overview

This SDK provides a unified solution for authentication in Node.js applications, combining password hashing, JWT generation, and Role-Based Access Control (RBAC). It is designed to be easy to integrate into your existing projects, offering middleware for Express and Fastify frameworks.

## Features

- **Password Hashing**: Securely hash and verify passwords using bcrypt.
- **JWT Authentication**: Generate and verify JSON Web Tokens for user sessions.
- **Role-Based Access Control**: Define roles and permissions to control access to resources.
- **TypeScript Support**: Fully typed SDK for better development experience.

## Installation

To install the SDK, run the following command:

```bash
npm install your-auth-sdk
```

## Usage

### Initialization

To initialize the authentication system, use the `initAuth` function:

```typescript
import { initAuth } from 'your-auth-sdk';

const auth = initAuth({
  jwtSecret: 'your-secret',
  saltRounds: 10,
  rolesConfig: {
    admin: {
      can: ['*']
    },
    user: {
      can: ['read:resource']
    }
  }
});
```

### Middleware

You can use the provided middleware for protecting your routes:

```typescript
import express from 'express';
import { authMiddleware, roleMiddleware } from 'your-auth-sdk/middleware';

const app = express();

app.use(authMiddleware);

app.get('/protected', (req, res) => {
  res.send('This is a protected route');
});

app.get('/admin', roleMiddleware('admin'), (req, res) => {
  res.send('This is an admin route');
});
```

## API Reference

### `initAuth(config: AuthConfig)`

Initializes the authentication system with the provided configuration.

### Middleware

- **`authMiddleware`**: Middleware to verify JWT tokens.
- **`roleMiddleware(requiredRoles: string | string[])`**: Middleware to check if the user has the required role.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.
import express from 'express';
import { initAuth } from './src/index';
import { authMiddleware } from './src/middleware/index';

const app = express();
const PORT = 3000;

// Simple in-memory user store for demo
const users: { [username: string]: { password: string; role: string } } = {};

// Initialize auth
const auth = initAuth({
  jwtSecret: 'demo-secret-key',
  saltRounds: 10,
  rolesConfig: {
    admin: { can: ['create:user', 'read:user', 'update:user', 'delete:user'] },
    user: { can: ['read:user', 'update:user'] }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Auth SDK Demo</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .message { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .link { text-align: center; margin-top: 20px; }
        .link a { color: #007bff; text-decoration: none; }
        .link a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>Auth SDK Demo - Login</h1>
      <form action="/login" method="POST">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Login</button>
      </form>
      <div class="link">
        <p>Don't have an account? <a href="/signup">Sign up here</a></p>
      </div>
      <div id="message"></div>
    </body>
    </html>
  `);
});

app.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Auth SDK Demo - Sign Up</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #218838; }
        .message { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .link { text-align: center; margin-top: 20px; }
        .link a { color: #007bff; text-decoration: none; }
        .link a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>Auth SDK Demo - Sign Up</h1>
      <form action="/signup" method="POST">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required minlength="6">
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <div class="link">
        <p>Already have an account? <a href="/">Login here</a></p>
      </div>
      <div id="message"></div>
    </body>
    </html>
  `);
});

app.post('/signup', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  try {
    // Validation
    if (password !== confirmPassword) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Signup Failed</title></head>
        <body>
          <h1>Signup Failed</h1>
          <p>Passwords do not match</p>
          <a href="/signup">Try Again</a>
        </body>
        </html>
      `);
    }

    if (users[username]) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Signup Failed</title></head>
        <body>
          <h1>Signup Failed</h1>
          <p>Username already exists</p>
          <a href="/signup">Try Again</a>
        </body>
        </html>
      `);
    }

    // Hash password and store user
    const hashedPassword = await auth.hashPassword(password);
    users[username] = { password: hashedPassword, role: 'user' };

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Signup Success</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; border: 1px solid #c3e6cb; }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>Account Created Successfully!</h1>
          <p>Welcome, ${username}! Your account has been created.</p>
        </div>
        <br>
        <a href="/">Login Now</a>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = users[username];

    if (!user) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Login Failed</title></head>
        <body>
          <h1>Login Failed</h1>
          <p>User not found</p>
          <a href="/">Try Again</a> | <a href="/signup">Sign Up</a>
        </body>
        </html>
      `);
    }

    // Verify password
    const isValid = await auth.verifyPassword(password, user.password);

    if (!isValid) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Login Failed</title></head>
        <body>
          <h1>Login Failed</h1>
          <p>Invalid password</p>
          <a href="/">Try Again</a>
        </body>
        </html>
      `);
    }

    // Generate token
    const token = auth.generateToken({ id: username, role: user.role }, '1h');

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login Success</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .token { background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; }
        </style>
      </head>
      <body>
        <h1>Login Successful!</h1>
        <p>Welcome back, ${username}!</p>
        <h3>Your JWT Token:</h3>
        <div class="token">${token}</div>
        <br>
        <a href="/protected">Access Protected Route</a> | <a href="/">Logout</a>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.get('/protected', authMiddleware(auth), (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Protected Route</title></head>
    <body>
      <h1>Protected Route</h1>
      <p>You are authenticated as: ${JSON.stringify(req.user)}</p>
      <a href="/">Home</a>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Demo server running at http://localhost:${PORT}`);
});

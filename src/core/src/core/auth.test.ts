import { initAuth } from '../../../index';

const auth = initAuth({
  jwtSecret: 'testsecret',
  saltRounds: 10,
  rolesConfig: {
    admin: { can: ['create:post'] },
    user: { can: ['read:post'] }
  }
});

test('hash and verify password', async () => {
  const hash = await auth.hashPassword('mypassword');
  expect(await auth.verifyPassword('mypassword', hash)).toBe(true);
});

test('generate and verify token', () => {
  const token = auth.generateToken({ id: '1', role: 'admin' }, '1h');
  const payload = auth.verifyToken(token);
  expect(payload?.role).toBe('admin');
});

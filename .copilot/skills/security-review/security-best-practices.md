# Security Best Practices

## Authentication

**Password Storage:**
```python
# Use bcrypt or argon2 — NEVER MD5, SHA1, or SHA256
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
bcrypt.checkpw(password.encode(), hashed)
```

**Session Management:**
- Regenerate session ID after login
- Set session expiry (idle: 30min, absolute: 8h)
- Use HttpOnly, Secure, SameSite cookies
- Invalidate session on logout (server-side)

**Multi-Factor Authentication:**
- Implement TOTP (time-based one-time passwords)
- Support hardware keys (WebAuthn/FIDO2) for sensitive accounts

## Authorization

**Patterns:**
```js
// Role-Based Access Control (RBAC)
function authorize(requiredRole) {
  return (req, res, next) => {
    if (!req.user.roles.includes(requiredRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
app.delete('/api/users/:id', authorize('admin'), deleteUser);

// Attribute-Based Access Control (ABAC) for complex rules
function canAccess(user, resource, action) {
  if (action === 'delete' && resource.ownerId !== user.id && !user.isAdmin) return false;
  return true;
}
```

## Input Validation

```js
// Whitelist validation (preferred)
const ALLOWED_SORT = ['name', 'date', 'price'];
const sort = ALLOWED_SORT.includes(req.query.sort) ? req.query.sort : 'date';

// Schema validation (Zod example)
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
});
const validated = UserSchema.parse(req.body); // Throws on invalid
```

**Rules:**
- Validate on the server — client validation is for UX only
- Whitelist allowed values (not blacklist bad values)
- Validate type, length, format, and range
- Reject unexpected fields

## Output Encoding

```js
// Prevent XSS — encode output based on context
// HTML context: encode < > & " '
// JavaScript context: JSON.stringify
// URL context: encodeURIComponent
// CSS context: escape special chars

// React does this automatically for JSX — but dangerouslySetInnerHTML bypasses it
// NEVER do: <div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## Security Headers

```js
// Express.js with helmet
const helmet = require('helmet');
app.use(helmet());

// Manual headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
```

## CORS Configuration

```js
// BAD: Allow everything
app.use(cors({ origin: '*', credentials: true })); // credentials + wildcard is invalid AND dangerous

// GOOD: Explicit allowlist
const ALLOWED_ORIGINS = ['https://app.example.com', 'https://admin.example.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

## Rate Limiting

```js
const rateLimit = require('express-rate-limit');

// General API rate limit
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Strict limit on auth endpoints
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
```

## Logging Security Events

**Log:** Failed logins, password changes, permission changes, data exports, admin actions.

**Never log:** Passwords, tokens, API keys, credit card numbers, SSNs.

```js
logger.info('auth.login_failed', {
  email: maskEmail(email),  // "a***@example.com"
  ip: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString(),
});
```

## Checklist
- [ ] Passwords hashed with bcrypt/argon2 (cost factor ≥ 12)
- [ ] Sessions have idle and absolute timeout
- [ ] Authorization checked on every protected endpoint
- [ ] All input validated server-side with whitelist approach
- [ ] Output encoded to prevent XSS
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] CORS restricted to explicit origins
- [ ] Auth endpoints rate-limited
- [ ] Security events logged (without sensitive data)
- [ ] HTTPS enforced everywhere

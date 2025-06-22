# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public issue

Please do not report security vulnerabilities through public GitHub issues.

### 2. Report privately

Instead, please send an email to: [security@teamterrain.com] (replace with actual contact)

Include the following information:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### 3. Response timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution**: Depends on severity and complexity

## Security Best Practices

### For Developers

- Never commit secrets, API keys, or passwords to the repository
- Use environment variables for all sensitive configuration
- Follow secure coding practices for authentication and authorization
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies up to date

### For Users

- Use strong, unique passwords
- Keep your Mapbox API tokens secure
- Use strong secrets for JWT_SECRET and API_AUTH_TOKEN
- Deploy with proper CORS configuration
- Use HTTPS in production
- Regularly update dependencies

## Known Security Considerations

### Authentication

- JWT tokens are used for session management
- API tokens are required for frontend-backend communication
- Admin privileges are controlled via email configuration

### Data Protection

- Passwords are hashed using bcryptjs
- Location data is stored with user consent
- No sensitive data is logged in production

### Network Security

- CORS is configurable for production domains
- Rate limiting is implemented to prevent abuse
- Helmet middleware provides security headers

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any potential similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible
5. Credit the reporter (if desired) in our changelog

Thank you for helping keep TeamTerrain and our users safe!

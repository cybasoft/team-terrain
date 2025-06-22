# Testing Guide

This document outlines the testing strategy and guidelines for TeamTerrain.

## Current Testing Status

Currently, the project relies on manual testing. We welcome contributions to add automated testing!

## Manual Testing Checklist

### Backend Testing

**API Endpoints:**

- [ ] `POST /api/auth/login` - User authentication
- [ ] `GET /api/users` - Get all users
- [ ] `PUT /api/users/user/:id` - Update user
- [ ] `POST /api/location/update` - Update location
- [ ] `GET /api/location/history/:userId` - Location history

**Authentication:**

- [ ] Valid login with correct credentials
- [ ] Invalid login with wrong credentials
- [ ] JWT token validation
- [ ] API key authentication
- [ ] Admin vs user permissions

**Database:**

- [ ] User creation and updates
- [ ] Location updates and history
- [ ] Data integrity and constraints

### Frontend Testing

**Authentication Flow:**

- [ ] Login form validation
- [ ] Successful login redirect
- [ ] Session persistence
- [ ] Logout functionality

**Map Functionality:**

- [ ] Map loads with Mapbox token
- [ ] User pins display correctly
- [ ] Click to place/update pin
- [ ] Drag to move pin (permission-based)
- [ ] Map style switching

**User Interface:**

- [ ] Responsive design on mobile
- [ ] User sidebar functionality
- [ ] Admin vs user UI differences
- [ ] Error message display

**Permissions:**

- [ ] Admin can move any pin
- [ ] Users can only move own pin
- [ ] Proper UI indicators for permissions

## Test Accounts

After running `bun run db:seed`:

- **Admin**: `admin@teamterrain.com` / `admin123`
- **Regular Users**: Various test users with `password123`

## Testing Tools

### API Testing

Use curl or Postman to test API endpoints:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teamterrain.com", "password": "admin123"}'

# Get users (with API token)
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer your-api-auth-token"
```

### Browser Testing

Test in multiple browsers:

- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers

## Future Testing Plans

We plan to implement:

### Backend Testing

- [ ] Unit tests with Jest
- [ ] Integration tests for API endpoints
- [ ] Database migration testing
- [ ] Authentication testing

### Frontend Testing

- [ ] Component testing with React Testing Library
- [ ] E2E testing with Playwright or Cypress
- [ ] Visual regression testing
- [ ] Accessibility testing

### Infrastructure Testing

- [ ] Docker container testing
- [ ] CI/CD pipeline testing
- [ ] Performance testing

## Contributing Tests

When adding new features:

1. **Manual Testing**: Always test your changes manually first
2. **Document Tests**: Update this guide with new test cases
3. **Automated Tests**: Consider adding automated tests for critical paths
4. **Cross-browser Testing**: Test on multiple browsers and devices

## Running Tests (Future)

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

## Test Data

Use the seed data for consistent testing:

- Multiple users with different locations
- Admin and regular user accounts
- Global location coverage

## Reporting Issues

When reporting bugs, include:

- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors

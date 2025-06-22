# Contributing to TeamTerrain

Thank you for your interest in contributing to TeamTerrain! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/teamterrain.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Follow the development setup guide in [DEVELOPMENT.md](DEVELOPMENT.md)

## Development Process

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- PostgreSQL
- Mapbox API token

### Local Development

1. **Backend Setup**:

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   bun install
   bun run db:migrate
   bun run db:seed
   bun run dev
   ```

2. **Frontend Setup**:

   ```bash
   cd frontend
   cp .env.example .env
   # Add your Mapbox token to .env
   bun install
   bun run dev
   ```

## Code Standards

### General Guidelines

- Write clear, self-documenting code
- Add comments for complex logic
- Follow existing code patterns and conventions
- Ensure your code works on both desktop and mobile

### Frontend Standards

- Use TypeScript strictly
- Follow React best practices
- Use shadcn/ui components when possible
- Maintain responsive design principles
- Test UI changes on multiple screen sizes

### Backend Standards

- Follow REST API conventions
- Implement proper error handling
- Add input validation for all endpoints
- Maintain database schema consistency
- Use middleware for cross-cutting concerns

## Testing

Currently, the project uses manual testing. When contributing:

1. Test your changes thoroughly on both frontend and backend
2. Verify all existing functionality still works
3. Test with different user roles (admin vs regular user)
4. Test on both desktop and mobile browsers

## Pull Request Process

1. **Before Submitting**:
   - Ensure your code follows the project standards
   - Test your changes thoroughly
   - Update documentation if needed
   - Make sure your branch is up to date with main

2. **PR Description**:
   - Clearly describe what your PR does
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process**:
   - PRs require review before merging
   - Address all review feedback
   - Keep your PR focused and atomic

## Reporting Issues

When reporting bugs or requesting features:

1. Check existing issues first
2. Use the issue templates if available
3. Provide clear reproduction steps for bugs
4. Include relevant environment information

## Security

- Never commit secrets, API keys, or passwords
- Use environment variables for configuration
- Follow security best practices for authentication
- Report security vulnerabilities privately

## Documentation

When adding new features:

- Update relevant README files
- Add JSDoc comments for new functions
- Update environment variable documentation
- Include usage examples where helpful

## Questions?

- Check the documentation in [README.md](README.md) and [DEVELOPMENT.md](DEVELOPMENT.md)
- Look through existing issues
- Create a new issue for questions

Thank you for contributing to TeamTerrain! 🗺️

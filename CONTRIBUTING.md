# Contributing to WhatsApp HTTP Service

## Philosophy

Keep it simple. This service does one thing: send WhatsApp messages through ONE session.

### What We Believe In

- **Single responsibility** - One service, one purpose
- **Simple over clever** - Readable code beats smart code
- **Explicit over implicit** - Clear is better than concise
- **No premature optimization** - Solve real problems, not imaginary ones
- **Be honest about limitations** - We don't hide what we can't do

## Guidelines

1. **No feature creep** - Every feature must have a clear use case
2. **No complex abstractions** - Keep it simple and direct
3. **Clear error messages** - Help users understand what went wrong
4. **Well-documented code** - JSDoc for all public functions
5. **Be honest about limitations** - Clear about what we support vs don't

## Development Process

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/caiopizzol/whatsapp-web-api.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

### Making Changes

1. Make your changes
2. Run linting: `npm run lint`
3. Run formatting: `npm run format`
4. Test manually (automated tests coming soon)
5. Commit with clear message
6. Push and create PR

### Code Style

- We use ESLint and Prettier (automatic via git hooks)
- Use JSDoc comments for functions
- Keep functions small and focused
- Prefer explicit over implicit code

## Pull Request Guidelines

- **Describe what your PR does** - Clear title and description
- **Reference any related issues** - Link to issues being fixed
- **Keep PRs focused** - One feature/fix per PR
- **Include examples** - Show how to use new features

## What We'd Love to See

- Support for more whatsapp-web.js features (media, groups, etc)
- Better error handling
- Performance improvements
- Documentation improvements

## What We Will Accept

- Bug fixes
- Security improvements
- Performance optimizations (with benchmarks)
- Documentation improvements
- Simple feature additions (with clear use case)

## What We Won't Accept

- **Multi-session management** - Use multiple instances instead
- **Message queuing** - Use RabbitMQ/Redis externally
- **Rate limiting** - Gateway responsibility
- **Database integration** - Keep it stateless
- **Complex configuration** - Environment variables only
- **Framework dependencies** - Stick to standard Node.js
- Features that significantly complicate the codebase

## Adding whatsapp-web.js Features

The underlying library supports many features we don't use yet:

- Media messages (images, documents, audio, video)
- Group messaging
- Reactions
- Status updates
- Contacts
- Location sharing

If you need these, feel free to add them! Just:

1. Keep the HTTP API simple
2. Add proper validation
3. Update the README
4. Include examples

## Architecture Decisions

If you're unsure about a design decision, ask yourself:

1. Does this solve a real problem?
2. Is this the simplest solution?
3. Does this add complexity for edge cases?
4. Can this be solved externally?

When in doubt, **choose simple**.

## Examples of Good Contributions

### ✅ Good

```javascript
// Clear, explicit error handling
if (!phone || typeof phone !== 'string') {
  throw new Error('Phone must be a non-empty string');
}
```

### ❌ Avoid

```javascript
// Clever but unclear
const isValid = phone?.length > 0 && typeof phone === 'string';
if (!isValid) throw new Error('Invalid phone');
```

## Testing

Currently manual testing. Future automated testing should be:

- Simple integration tests
- No complex mocking
- Real WhatsApp service tests (with test numbers)
- Always test with real resource monitoring (Puppeteer is heavy)

## Need Help?

- Open an issue for questions
- Check existing issues first
- Be specific about your use case
- Include relevant code/config

## Code of Conduct

Be respectful, be helpful, be constructive. We're all here to build something useful together.

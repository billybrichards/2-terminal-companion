# Testing Documentation

This repository contains a comprehensive test suite following Clean Architecture principles.

## Test Structure

```
tests/
├── setup.ts                          # Global test setup
├── utils/                            # Test utilities
│   ├── testDatabase.ts              # Database setup/teardown utilities
│   └── testServer.ts                # Test Express app creation
├── infrastructure/                   # Infrastructure layer tests
│   ├── auth/
│   │   └── JWTAdapter.test.ts      # JWT authentication tests
│   ├── database/
│   │   └── database.test.ts        # Database connection tests
│   └── adapters/                    # External adapter tests
├── e2e/                             # End-to-end API tests
│   ├── auth/
│   │   └── authRoutes.test.ts      # Authentication endpoints
│   ├── health/
│   │   └── healthRoutes.test.ts    # Health check endpoints
│   └── workflows/
│       └── completeWorkflows.test.ts # Complete user journeys
└── application/                     # Use case tests (future)
```

## Clean Architecture Layers

Our tests are organized according to Clean Architecture principles:

### 1. Infrastructure Layer Tests
Tests for adapters and external dependencies:
- **JWT Adapter**: Password hashing, token generation/verification
- **Database**: Connection, schema validation, CRUD operations
- **Ollama Gateway**: LLM communication (when available)
- **Email Service**: Email sending capabilities
- **Stripe**: Payment integration

### 2. Application/Use Case Layer Tests
Tests for business logic orchestration (future):
- Conversation management
- Message handling
- User preferences management

### 3. Interface Adapter Tests (E2E)
Tests for API routes and HTTP interfaces:
- Authentication routes (register, login, logout, refresh)
- Chat routes (config, streaming, non-streaming)
- Conversation routes (CRUD operations)
- Settings routes (user preferences)
- Admin routes (configuration, user management)
- Health routes (server, database, Ollama status)

### 4. End-to-End Workflow Tests
Tests for complete user journeys:
- Registration → Login → Chat flow
- Conversation persistence
- Preference override flows
- Multi-session management

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests by Layer
```bash
# Infrastructure layer tests
npm run test:infrastructure

# End-to-end API tests
npm run test:e2e

# Specific route tests
npm run test:auth
npm run test:health
npm run test:workflows
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Environment

Tests use a separate SQLite database (`./data/test.db`) that is created and destroyed for each test suite.

### Environment Variables
Tests use `.env.test` for configuration:
- `DATABASE_URL`: Test database path
- `JWT_SECRET`: Test JWT secret
- `OLLAMA_BASE_URL`: Ollama endpoint (may not be available)
- Other test-specific configuration

### Test Database
- Automatically created before each test suite
- Automatically cleaned up after tests
- Isolated from development/production databases

## Writing New Tests

### Infrastructure Tests
Test adapters and external integrations:

```typescript
import { jwtAdapter } from '../../../server/infrastructure/auth/JWTAdapter';

describe('MyAdapter', () => {
  it('should perform adapter function', () => {
    // Test adapter behavior
  });
});
```

### E2E API Tests
Test HTTP endpoints:

```typescript
import request from 'supertest';
import { createTestApp } from '../../utils/testServer';
import { setupTestDatabase, teardownTestDatabase } from '../../utils/testDatabase';

describe('My Routes E2E', () => {
  let app: any;
  let db: any;

  beforeAll(async () => {
    db = await setupTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should handle request', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
  });
});
```

### Workflow Tests
Test complete user journeys:

```typescript
describe('User Journey', () => {
  it('should complete flow from A to Z', async () => {
    // Step 1: Initial action
    const step1 = await request(app).post('/api/action1');
    
    // Step 2: Follow-up action
    const step2 = await request(app)
      .post('/api/action2')
      .set('Authorization', `Bearer ${step1.body.token}`);
    
    // Verify complete flow
    expect(step2.status).toBe(200);
  });
});
```

## Best Practices

### 1. Test Independence
- Each test should be independent
- Use `beforeEach`/`afterEach` for test isolation
- Don't rely on test execution order

### 2. Clean Architecture Principles
- Test each layer separately
- Mock external dependencies
- Test behavior, not implementation details

### 3. Meaningful Assertions
- Use descriptive test names
- Test both success and failure cases
- Verify complete response structure

### 4. Test Data Management
- Use test utilities for creating test data
- Clean up test data after tests
- Use realistic test data

### 5. Error Cases
- Test validation errors
- Test authentication failures
- Test edge cases and boundary conditions

## Test Coverage Goals

- **Infrastructure Layer**: 90%+ coverage
- **Application Layer**: 90%+ coverage
- **Interface Adapters**: 85%+ coverage
- **Overall**: 85%+ coverage

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Manual triggers

## Troubleshooting

### Tests Failing Locally
1. Ensure `.env.test` is configured
2. Check test database permissions
3. Verify Node.js version compatibility

### Database Errors
1. Delete `./data/test.db` manually
2. Ensure data directory exists
3. Check file permissions

### Timeout Errors
1. Increase test timeout in jest.config.js
2. Check for blocking operations
3. Verify async/await usage

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Test all happy paths
3. Test error cases
4. Update this documentation
5. Ensure all tests pass before submitting PR

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

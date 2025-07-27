# 🤝 Contributing to Mindcare

Thank you for your interest in contributing to the Mindcare healthcare platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity.

### Expected Behavior

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Flutter 3.16+ (for mobile development)
- Git
- Basic knowledge of TypeScript, React, and Flutter

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/MindCare.git
cd MindCare

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
cd backend
npm run db:generate
npm run db:push
npm run db:seed

# Start development servers
npm run dev
```

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality
fix(api): resolve appointment booking conflict detection
docs(readme): update installation instructions
```

### Development Process

1. **Create a branch** from `main`
2. **Make your changes** following coding standards
3. **Write tests** for new functionality
4. **Run tests** and ensure they pass
5. **Update documentation** if needed
6. **Submit a pull request**

## 🎨 Coding Standards

### TypeScript/JavaScript

```typescript
// Use TypeScript for all new code
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Use meaningful variable names
const getUserById = async (userId: string): Promise<User | null> => {
  // Implementation
};

// Use async/await instead of promises
const user = await getUserById('123');
```

### React Components

```tsx
// Use functional components with hooks
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

export const UserProfile: React.FC<Props> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};
```

### Flutter/Dart

```dart
// Use meaningful class and method names
class AuthenticationService {
  Future<User?> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    // Implementation
  }
}

// Use proper error handling
try {
  final user = await authService.signInWithEmailAndPassword(
    email: email,
    password: password,
  );
  return user;
} catch (e) {
  logger.error('Authentication failed: $e');
  rethrow;
}
```

### CSS/Styling

```css
/* Use Tailwind CSS classes when possible */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200;
}

/* Use semantic class names */
.appointment-card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}
```

## 🧪 Testing Guidelines

### Backend Testing

```typescript
// Unit tests for services
describe('AppointmentService', () => {
  it('should create appointment successfully', async () => {
    const appointmentData = {
      patientId: 'patient-123',
      providerId: 'provider-456',
      scheduledAt: new Date(),
      duration: 60,
    };
    
    const appointment = await appointmentService.create(appointmentData);
    
    expect(appointment).toBeDefined();
    expect(appointment.patientId).toBe(appointmentData.patientId);
  });
});

// Integration tests for API endpoints
describe('POST /api/appointments', () => {
  it('should create appointment with valid data', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validAppointmentData)
      .expect(201);
      
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Testing

```tsx
// Component tests
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    const mockOnSubmit = jest.fn();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Flutter Testing

```dart
// Widget tests
testWidgets('LoginPage should display login form', (WidgetTester tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: LoginPage(),
    ),
  );

  expect(find.byType(TextField), findsNWidgets(2)); // Email and password fields
  expect(find.byType(ElevatedButton), findsOneWidget); // Login button
  expect(find.text('Sign In'), findsOneWidget);
});

// Unit tests for services
group('AuthenticationService', () {
  test('should sign in user with valid credentials', () async {
    final authService = AuthenticationService();
    
    final user = await authService.signInWithEmailAndPassword(
      email: 'test@example.com',
      password: 'password123',
    );
    
    expect(user, isNotNull);
    expect(user!.email, equals('test@example.com'));
  });
});
```

## 📝 Pull Request Process

### Before Submitting

1. **Ensure tests pass**: Run `npm test` and fix any failing tests
2. **Check code quality**: Run `npm run lint` and fix any issues
3. **Update documentation**: Update relevant documentation
4. **Test manually**: Test your changes in the development environment

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows the project's coding standards
- [ ] Self-review of code completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings or errors introduced
```

### Review Process

1. **Automated checks**: CI/CD pipeline runs tests and quality checks
2. **Code review**: At least one maintainer reviews the code
3. **Testing**: Changes are tested in a staging environment
4. **Approval**: Maintainer approves and merges the pull request

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the bug
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, browser, Node.js version, etc.
- **Screenshots**: If applicable, add screenshots

### Feature Requests

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use case**: Why this feature would be useful
- **Acceptance criteria**: How to know when the feature is complete
- **Additional context**: Any other relevant information

### Security Issues

For security-related issues:

- **Do not** create a public issue
- **Email** the maintainers directly
- **Include** detailed information about the vulnerability
- **Wait** for a response before disclosing publicly

## 🏷️ Labels and Milestones

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issue
- `priority: low` - Low priority issue

### Milestones

- `v1.0.0` - Initial release
- `v1.1.0` - First feature update
- `v2.0.0` - Major version update

## 🎓 Learning Resources

### Healthcare Domain Knowledge

- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)
- [HL7 FHIR Standards](https://www.hl7.org/fhir/)
- [Healthcare Data Security](https://www.healthit.gov/topic/privacy-security-and-hipaa)

### Technical Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Flutter Documentation](https://docs.flutter.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🙏 Recognition

Contributors will be recognized in:

- **README.md**: Contributors section
- **Release notes**: Major contributions highlighted
- **GitHub**: Contributor badges and statistics

## 📞 Getting Help

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Email**: For security issues and private matters

---

Thank you for contributing to Mindcare! Together, we're building a platform that will improve healthcare for everyone. 🏥💙

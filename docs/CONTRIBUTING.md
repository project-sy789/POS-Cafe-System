# Contributing to Cafe POS System

Thank you for your interest in contributing to the Cafe POS System! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## 📜 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards others

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Node version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear description** of the feature
- **Use case** - why is this feature needed?
- **Possible implementation** (if you have ideas)
- **Alternatives considered**

### Code Contributions

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🛠️ Development Setup

### Prerequisites

- Node.js 16+
- MongoDB 5+
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/cafe-pos-system.git
cd cafe-pos-system

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/cafe-pos-system.git

# Install dependencies
cd server && npm install
cd ../client && npm install

# Setup environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# Seed database
cd server && npm run seed

# Run development servers
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

## 📝 Coding Standards

### JavaScript/React

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use functional components with hooks
- Keep components small and focused
- Write meaningful variable names

### File Structure

```
client/src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API services
├── store/         # State management
├── hooks/         # Custom hooks
└── utils/         # Utility functions

server/src/
├── controllers/   # Route controllers
├── models/        # Database models
├── routes/        # API routes
├── middleware/    # Custom middleware
└── utils/         # Utility functions
```

### Naming Conventions

- **Components:** PascalCase (e.g., `ProductCard.jsx`)
- **Files:** camelCase (e.g., `userService.js`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_URL`)
- **Functions:** camelCase (e.g., `getUserData`)
- **CSS Classes:** kebab-case (e.g., `product-card`)

### Code Style

```javascript
// ✅ Good
const getUserById = async (id) => {
  try {
    const user = await User.findById(id)
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// ❌ Bad
const getuser = async (id) => {
  const user = await User.findById(id)
  return user
}
```

### React Components

```javascript
// ✅ Good
const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)
  
  const handleAddToCart = () => {
    onAddToCart(product, quantity)
  }
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  )
}

export default ProductCard
```

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks

### Examples

```bash
feat(pos): add product search functionality

- Implement search bar in POS page
- Add debounced search API call
- Update UI to show search results

Closes #123

---

fix(barista): resolve order status update issue

- Fix Socket.IO event listener
- Update order status correctly
- Add error handling

Fixes #456

---

docs(readme): update installation instructions

- Add MongoDB setup steps
- Update environment variables
- Add troubleshooting section
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork**
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

2. **Create feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make changes and commit**
```bash
git add .
git commit -m "feat: add your feature"
```

4. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added/updated (if applicable)
- [ ] All tests pass
- [ ] PR title follows commit guidelines
- [ ] Description explains changes clearly

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
```

### Review Process

1. Maintainer will review your PR
2. Address any requested changes
3. Once approved, PR will be merged
4. Your contribution will be credited

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 96]
- Node version: [e.g., 16.13.0]
- MongoDB version: [e.g., 5.0.3]

**Additional context**
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Screenshots, mockups, or examples

**Would you like to implement this feature?**
- [ ] Yes, I can work on this
- [ ] No, just suggesting
```

## 🧪 Testing

### Running Tests

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

### Writing Tests

- Write tests for new features
- Update tests for bug fixes
- Aim for good coverage
- Test edge cases

## 📚 Documentation

### Updating Documentation

- Update README.md for major changes
- Update INSTALLATION.md for setup changes
- Add JSDoc comments for functions
- Update API documentation

### Documentation Style

```javascript
/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object
 * @throws {Error} If user not found
 */
const getUserById = async (id) => {
  // Implementation
}
```

## 🎯 Areas for Contribution

### High Priority

- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation
- [ ] Performance optimization
- [ ] Accessibility improvements

### Medium Priority

- [ ] UI/UX enhancements
- [ ] Additional features
- [ ] Code refactoring
- [ ] Documentation improvements

### Low Priority

- [ ] Code comments
- [ ] Example projects
- [ ] Tutorials
- [ ] Translations

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📞 Getting Help

- **Questions:** Open a discussion on GitHub
- **Issues:** Create an issue
- **Chat:** Join our community (if available)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🙏

Made with ❤️ for coffee lovers ☕

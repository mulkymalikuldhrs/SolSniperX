# Contributing to SolSniperX

Thank you for your interest in contributing to SolSniperX! This guide provides comprehensive instructions for contributing to the project, whether you are fixing a bug, adding a new feature, improving documentation, or enhancing existing functionality. We welcome contributions from developers of all skill levels.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Environment Setup](#development-environment-setup)
- [Project Architecture Overview](#project-architecture-overview)
- [How to Contribute](#how-to-contribute)
- [Backend Contributions](#backend-contributions)
- [Frontend Contributions](#frontend-contributions)
- [Adding a New Service](#adding-a-new-service)
- [Adding a New API Route](#adding-a-new-api-route)
- [Adding a New Frontend Page](#adding-a-new-frontend-page)
- [Running Tests](#running-tests)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Security Vulnerability Reporting](#security-vulnerability-reporting)
- [Community](#community)

---

## Code of Conduct

Be respectful and professional in all interactions. We are committed to providing a welcoming and inclusive experience for everyone. Please report any unacceptable behavior to mulkymalikuldhaher@email.com.

---

## Development Environment Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm 10+
- Git

### Backend Setup

1. **Fork and clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/SolSniperX.git
    cd SolSniperX
    ```

2. **Set up the backend virtual environment:**
    ```bash
    cd backend
    python3.11 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. **Configure environment variables:**
    Create a `.env` file in the `backend` directory with your API keys and wallet configuration. Refer to the README.md for the required variables. The `.env` file is excluded from version control.

4. **Start the backend server:**
    ```bash
    python src/main.py
    ```
    The server starts on `http://0.0.0.0:5000`.

### Frontend Setup

1. **Install frontend dependencies:**
    ```bash
    cd frontend
    pnpm install
    ```

2. **Start the development server:**
    ```bash
    pnpm run dev
    ```
    The dev server starts on `http://localhost:5173`.

### Quick Start

Use the development launcher script to start both servers simultaneously:
```bash
./start_dev.sh
```

---

## Project Architecture Overview

SolSniperX follows a client-server architecture with clear separation between backend services and frontend presentation:

**Backend (Python Flask):**
- Flask serves as the API framework with Flask-SocketIO for real-time WebSocket communication
- Services are instantiated in `main.py` and registered in the app context
- Route blueprints provide modular API endpoint organization
- Background tasks (mempool monitoring, auto-trading) run via eventlet

**Frontend (React):**
- React 19 with React Router for client-side routing
- Context API for state management (API, WebSocket, Theme)
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS 4 for styling
- Vite for fast development builds

Understanding this separation is crucial for making effective contributions. Backend changes should not require frontend modifications unless the API contract changes, and vice versa.

---

## How to Contribute

### Contribution Workflow

1. **Check existing issues** or create a new one describing your proposed change
2. **Fork the repository** and create a feature branch from `master`
3. **Make your changes** following the coding standards below
4. **Test your changes** thoroughly in your local development environment
5. **Commit your changes** with a descriptive commit message
6. **Submit a pull request** with a clear description of the changes

### Types of Contributions We Welcome

- **Bug fixes**: Resolve issues reported in the GitHub Issues tracker
- **New services**: Add new backend services (e.g., Telegram notifications, advanced order types)
- **New API endpoints**: Extend the backend API with new functionality
- **New frontend features**: Add new pages, components, or visualizations
- **Performance improvements**: Optimize data fetching, WebSocket handling, or rendering
- **Security enhancements**: Improve private key handling, API key management, or input validation
- **Documentation**: Fix typos, add examples, improve clarity
- **Anti-rug improvements**: Enhance rug detection algorithms and emergency sell mechanisms

---

## Backend Contributions

### Coding Conventions

- Follow **PEP 8** style guide for Python code
- Use **type hints** for function signatures and return types
- Use **async/await** for all I/O-bound operations (API calls, WebSocket communication, blockchain interactions)
- Handle errors gracefully with informative error messages using the `error_response` utility
- Use the `logging` module instead of `print()` for all output

### Service Pattern

All backend services follow a consistent pattern:
- Accept `socketio` instance in the constructor for WebSocket communication
- Emit events using `self.socketio.emit(event_name, data)` for real-time updates
- Implement both synchronous and asynchronous methods as appropriate
- Handle configuration through the `config.py` module

### Adding a New Service

1. **Create the service file** in `backend/src/services/` (e.g., `telegram_notifier.py`).
2. **Implement the service class** following the existing pattern:
    ```python
    import logging

    class TelegramNotifierService:
        def __init__(self, socketio=None):
            self.socketio = socketio
            self.logger = logging.getLogger(__name__)

        async def send_notification(self, message: str):
            # Implementation here
            pass
    ```
3. **Register the service** in `main.py` by instantiating it and adding it to `app.services`.
4. **Create API routes** in `backend/src/routes/` if the service needs external endpoints.
5. **Add dependencies** to `requirements.txt` if the service requires new packages.

### Adding a New API Route

1. **Create a route blueprint** in `backend/src/routes/` (e.g., `notifications.py`).
2. **Define the blueprint and routes:**
    ```python
    from flask import Blueprint, request, jsonify

    notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

    @notifications_bp.route('/status', methods=['GET'])
    def get_notification_status():
        # Implementation
        return jsonify({'status': 'active'})
    ```
3. **Register the blueprint** in `main.py` with `app.register_blueprint(notifications_bp)`.
4. **Document the endpoint** in the README.md API Endpoints section.

---

## Frontend Contributions

### Coding Conventions

- Use **functional components** with hooks (no class components)
- Follow the **existing file structure**: pages in `pages/`, reusable components in `components/`, contexts in `contexts/`
- Use **Tailwind CSS classes** for styling; avoid inline styles
- Use **shadcn/ui components** from `components/ui/` when available
- Maintain **dark mode compatibility** for all new UI elements

### Adding a New Frontend Page

1. **Create the page component** in `frontend/src/pages/` (e.g., `AlertsPage.jsx`).
2. **Implement the component** using the existing page pattern:
    ```jsx
    import { motion } from 'framer-motion';

    function AlertsPage() {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page content */}
        </motion.div>
      );
    }

    export default AlertsPage;
    ```
3. **Add the route** in `App.jsx` following the existing pattern.
4. **Add navigation entry** in `Sidebar.jsx` if appropriate.
5. **Connect to the API** using `ApiContext` for REST calls and `WebSocketContext` for real-time data.

### Adding a New UI Component

1. **Check shadcn/ui** for existing components that can be installed via the CLI.
2. **Create custom components** in `frontend/src/components/` following the existing pattern.
3. **Ensure accessibility** by using proper ARIA attributes and keyboard navigation.
4. **Test responsiveness** across different screen sizes.

---

## Running Tests

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend Linting

```bash
cd frontend
pnpm run lint
```

### Frontend Build Test

```bash
cd frontend
pnpm run build
```

Always ensure that the frontend builds successfully and the backend tests pass before submitting a pull request.

---

## Coding Standards

### General

- Write clean, well-commented, and modular code
- Use descriptive variable and function names
- Keep functions small and focused on a single responsibility
- Handle errors gracefully with informative messages
- Never hardcode API keys, private keys, or sensitive data
- All secrets must be loaded from environment variables

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints for all function signatures
- Use f-strings for string formatting
- Use the `logging` module for all output
- Prefer async/await for I/O operations

### JavaScript (Frontend)

- Use ES6+ syntax (arrow functions, destructuring, template literals)
- Use functional components with hooks
- Follow the existing import organization pattern
- Use meaningful component and variable names
- Prefer named exports for better debugging

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Scope Examples

- `backend`: Backend-related changes
- `frontend`: Frontend-related changes
- `services`: Service layer changes
- `api`: API endpoint changes
- `ui`: UI component changes

### Examples

```
feat(services): add Telegram notification service
fix(trading): correct Jupiter swap transaction signing
docs(readme): update API endpoint documentation
feat(ui): add alerts page with real-time notifications
```

---

## Pull Request Process

1. **Update documentation**: Ensure that any new features or changed behavior are reflected in the relevant documentation files (README.md, ARCHITECTURE.md, etc.).

2. **Test thoroughly**: Verify that both the backend and frontend work correctly with your changes. Test edge cases and error conditions.

3. **Write a clear PR description**: Include:
    - What the change does and why it is needed
    - How to test the change
    - Any breaking changes or migration steps
    - Links to related issues

4. **Keep PRs focused**: Each pull request should address a single concern. Large, multi-purpose PRs are harder to review and slower to merge.

5. **Respond to review feedback**: Address all review comments and make requested changes promptly.

---

## Reporting Issues

When reporting bugs or requesting features, please use the GitHub Issues tracker and include:

**For bugs:**
- A clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your environment (Python version, Node.js version, OS, etc.)
- Relevant log output or error messages

**For features:**
- A clear description of the proposed feature
- The use case it addresses
- Any alternative solutions you have considered

---

## Security Vulnerability Reporting

If you discover a security vulnerability, especially related to private key handling or API key exposure, please report it responsibly by emailing mulkymalikuldhaher@email.com instead of opening a public issue. We take security vulnerabilities seriously and will respond promptly.

---

## Community

- GitHub: [https://github.com/mulkymalikuldhrs/SolSniperX](https://github.com/mulkymalikuldhrs/SolSniperX)
- Related Project: [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS)
- Maintainer: Mulky Malikul Dhaher (mulkymalikuldhaher@email.com)

Thank you for helping to make SolSniperX better. Your contributions, no matter how small, are valued and appreciated.

---

**⚠️ For Education Purpose Only** — This project is provided strictly for educational and research purposes. The authors and contributors assume **no responsibility or liability** for any damages, losses, or risks arising from the use of this software. **We do not bear any responsibility or risk** for how this software is used.

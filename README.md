# Documentum

A Python project with isolated development environment.

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/devnish23/documentum.git
   cd documentum
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\Activate.ps1  # Windows PowerShell
   # or
   source venv/bin/activate    # Linux/Mac
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Development

- The virtual environment is already set up and activated
- All Python packages will be installed in the isolated environment
- The `.gitignore` file excludes the virtual environment from version control
- **Automated Development Workflow**: No manual intervention required
- **Auto-Healing**: Automatic failure recovery
- **Continuous Integration**: Seamless development pipeline

## Automated Workflow

### No Manual Intervention Required

The project uses a fully automated development workflow that eliminates all manual steps:

```bash
# Run complete automated workflow
npm run dev:auto

# Run automated git operations
npm run git:auto

# Run demo of automation
npm run demo
```

### Key Features

- **🚀 Automated Git Operations**: No manual commit/push required
- **🔧 Automated Development**: Linting, testing, building all automated
- **🧪 Automated Testing**: Playwright E2E tests with auto-healing
- **📚 Automated Documentation**: Real-time documentation updates
- **🚀 Automated Deployment**: Continuous deployment pipeline
- **🔄 Auto-Healing**: Automatic failure recovery and retry mechanisms

### Workflow Steps

1. **Environment Setup**: Automatic dependency installation
2. **Development Tasks**: Automated linting, type checking, building
3. **Testing**: Comprehensive E2E testing with auto-healing
4. **Documentation**: Real-time documentation updates
5. **Git Operations**: Automated commit and push
6. **Deployment**: Automated deployment with health checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE). 
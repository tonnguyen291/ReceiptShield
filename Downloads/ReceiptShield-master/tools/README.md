# Development Tools

This directory contains development tools and utilities for the ReceiptShield project.

## Contents

### PlantUML (`plantuml.jar`)

PlantUML is used to generate architecture diagrams from `.puml` source files.

**Usage:**
```bash
# Generate specific diagram
java -jar tools/plantuml.jar docs/architecture/c4-context.puml

# Generate all architecture diagrams
./tools/generate-diagrams.sh
```

**Requirements:**
- Java 17+ (installed via `brew install openjdk@17`)
- Graphviz (installed via `brew install graphviz`)

### Diagram Generator (`generate-diagrams.sh`)

Convenience script to generate all PlantUML diagrams in the project.

**Usage:**
```bash
# Generate all diagrams in docs/architecture/
./tools/generate-diagrams.sh

# Generate specific file(s)
./tools/generate-diagrams.sh docs/architecture/c4-context.puml
```

**Outputs:**
- PNG images in the same directory as source `.puml` files
- Automatically creates/updates diagram images

## Installation

### Java (for PlantUML)

```bash
# macOS
brew install openjdk@17

# Add to PATH (in ~/.zshrc or ~/.bashrc)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

### Graphviz (for full diagram support)

```bash
# macOS
brew install graphviz

# Ubuntu/Debian
sudo apt-get install graphviz

# Windows
choco install graphviz
```

## Adding New Tools

When adding new development tools:

1. Place the tool/script in this directory
2. Update this README with:
   - Tool description
   - Installation instructions
   - Usage examples
   - Requirements/dependencies
3. Add tool outputs to `.gitignore` if necessary
4. Make scripts executable: `chmod +x toolname.sh`

## Tool Guidelines

- **Keep tools portable**: Use cross-platform compatible code where possible
- **Document dependencies**: List all required software/packages
- **Version control**: Check in tools that are small and project-specific
- **Large binaries**: Add to `.gitignore`, provide download instructions
- **Script standards**: Use consistent shebang lines and error handling

## Available Commands

```bash
# Generate PlantUML diagrams
./tools/generate-diagrams.sh

# (Add more tool commands as they are added)
```

## Troubleshooting

### PlantUML Issues

**Java not found:**
```bash
# Check Java installation
java -version

# Install if missing
brew install openjdk@17
```

**Graphviz not found:**
```bash
# Check Graphviz installation
dot -V

# Install if missing
brew install graphviz
```

**Permission denied:**
```bash
# Make script executable
chmod +x tools/generate-diagrams.sh
```

## Related Documentation

- [Architecture Documentation](../docs/architecture/)
- [C4 Architecture Diagrams](../docs/architecture/C4_ARCHITECTURE.md)
- [Development Setup](../CONTRIBUTING.md#development-setup)


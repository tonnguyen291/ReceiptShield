# Scripts Directory

Operational and utility scripts organized by function.

## Directory Structure

```
scripts/
├── deployment/      # Deployment automation scripts
├── setup/          # Initial setup and configuration
├── testing/        # Testing and validation scripts
└── tools/          # Utility and helper tools
```

## Deployment Scripts

### `deployment/deploy.sh`
Full Firebase App Hosting deployment with all services.

```bash
./scripts/deployment/deploy.sh
```

### `deployment/deploy-minimal.sh`
Minimal deployment for quick iterations.

### `deployment/test-deployment.sh`
Smoke tests for deployed environments.

## Setup Scripts

### `setup/setup-firebase.sh`
Bootstrap Firebase configuration locally.

```bash
./scripts/setup/setup-firebase.sh
```

### `setup/setup-monitoring.sh`
Provision monitoring infrastructure.

### `setup/setup-gmail-secrets.sh`
Configure Gmail API secrets for email functionality.

## Testing Scripts

### `testing/test-auth.js`
Authentication flow testing.

```bash
node scripts/testing/test-auth.js
```

### `testing/test-monitoring.sh`
Monitoring system validation.

## Tools

### `tools/verify-domain.sh`
DNS and SSL verification helper.

```bash
./scripts/tools/verify-domain.sh example.com
```

### `tools/verify-firebase.js`
Firebase configuration validator.

### `tools/check-firebase-status.js`
Firebase services status checker.

### `tools/get-firebase-token.js`
Firebase authentication token retriever.

## Usage Guidelines

1. **Always review scripts before execution** - Especially deployment scripts
2. **Check permissions** - Ensure scripts are executable (`chmod +x script.sh`)
3. **Environment variables** - Many scripts require `.env` configuration
4. **Logging** - Scripts output to console and may create log files
5. **Error handling** - Scripts exit with non-zero codes on failure

## Prerequisites

- Node.js 18+ (for `.js` scripts)
- Bash 4+ (for `.sh` scripts)
- Firebase CLI installed globally
- Appropriate environment variables set

## Best Practices

- Run setup scripts before deployment
- Use test scripts after deployment
- Keep scripts idempotent when possible
- Document any new scripts added to this directory


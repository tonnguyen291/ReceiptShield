# 🔄 Manual Fork Sync Commands

## Initial Setup (One-time)
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ReceiptShield.git
cd ReceiptShield

# Add upstream remote
git remote add upstream https://github.com/Intelligent-Expense-Management/ReceiptShield.git

# Verify remotes
git remote -v
```

## Sync Commands (Run when you want updates)
```bash
# Fetch latest changes from upstream
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

## Quick Sync Script
Create a file called `sync.sh`:
```bash
#!/bin/bash
echo "🔄 Syncing fork with upstream..."
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
echo "✅ Sync complete!"
```

Make it executable:
```bash
chmod +x sync.sh
./sync.sh
```

## Check for Updates
```bash
# See if there are new commits
git fetch upstream
git log HEAD..upstream/main --oneline

# If there are updates, sync them
git merge upstream/main
git push origin main
```

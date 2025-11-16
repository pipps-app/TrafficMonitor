# Quick Start: Push to GitHub

# Step 1: Configure Git (replace with your information)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Step 2: Initialize repository
git init

# Step 3: Add all files
git add .

# Step 4: Create initial commit
git commit -m "Initial commit: Visitor Tracker App with Cloud Run support"

# Step 5: Connect to GitHub repository
git remote add origin https://github.com/pipps-app/TrafficMonitor.git

# Step 6: Set main branch
git branch -M main

# Step 7: Push to GitHub
# Note: You'll need a GitHub Personal Access Token
# Get one from: https://github.com/settings/tokens
git push -u origin main

# If you have existing commits in the GitHub repo, use:
# git pull origin main --allow-unrelated-histories
# git push -u origin main

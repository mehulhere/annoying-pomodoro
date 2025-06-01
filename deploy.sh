#!/bin/bash

# Annoying Pomodoro Deployment Script

echo "🚀 Starting deployment process for Annoying Pomodoro..."

# Remove old build directory
echo "🧹 Cleaning previous build..."
rm -rf build

# Build the app
echo "🔨 Building production version..."
npm run build

echo "📤 Deploying to GitHub Pages..."

# Save the current branch to return to it later
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📌 Current branch: $CURRENT_BRANCH"

# Create a temporary directory for deployment
DEPLOY_DIR=$(mktemp -d)
echo "📂 Created temporary directory: $DEPLOY_DIR"

# Copy build files to the temporary directory
echo "📋 Copying build files..."
cp -r build/* $DEPLOY_DIR/
cp -r build/.* $DEPLOY_DIR/ 2>/dev/null || true # Copy hidden files too, ignore errors

# Add a .nojekyll file to bypass Jekyll processing on GitHub Pages
touch $DEPLOY_DIR/.nojekyll

# Add a timestamp file to ensure we always have a change to commit
echo "Deployed at $(date)" > $DEPLOY_DIR/deploy-timestamp.txt

# Attempt to checkout gh-pages branch safely
echo "🔄 Checking out gh-pages branch..."
if ! git checkout gh-pages; then
  echo "❌ Failed to checkout gh-pages branch."
  echo "💡 Creating gh-pages branch..."
  git checkout --orphan gh-pages
  git rm -rf .
else
  # Clean the branch, keeping only .git directory
  echo "🧹 Cleaning gh-pages branch..."
  find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} \; 2>/dev/null || true
fi

# Copy the build files from the temporary directory
echo "📋 Copying build files to gh-pages branch..."
cp -r $DEPLOY_DIR/* .
cp -r $DEPLOY_DIR/.* . 2>/dev/null || true # Copy hidden files too, ignore errors

# Setup git identity for commit if needed
if [ -z "$(git config user.name)" ]; then
  git config user.name "GitHub Pages Deployment"
  git config user.email "deployment@example.com"
fi

# Add, commit, and push the changes
echo "💾 Committing changes to gh-pages branch..."
git add -A
git commit -m "Deploy website - $(date)" --allow-empty

echo "⬆️ Pushing to GitHub..."
if git push origin gh-pages; then
  echo "✅ Successfully deployed to GitHub Pages!"
else
  echo "❌ Failed to push to GitHub. Please check your credentials and try again."
  git checkout "$CURRENT_BRANCH"
  exit 1
fi

# Switch back to the original branch
echo "🔙 Switching back to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

# Clean up the temporary directory
echo "🧹 Cleaning up temporary directory..."
rm -rf $DEPLOY_DIR

echo "🏁 Deployment process complete!"
echo "🌐 Your site should be available shortly at: https://$(git config --get remote.origin.url | sed -e 's/^git@github.com://' -e 's/\.git$//' -e 's/.*github.com\///' | awk -F'/' '{print $1}').github.io/annoying-pomodoro/" 
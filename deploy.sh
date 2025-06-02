npm run build

cp -r build/* .

git add .
# Add time too
git commit -m "Deploying to GitHub Pages $(date)" 
commit_id=$(git rev-parse --short HEAD)
git push origin $commit_id:main --force
git push origin $commit_id:gh-pages --force
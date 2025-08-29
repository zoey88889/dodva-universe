cat > deploy.sh <<'EOF'
#!/usr/bin/env bash
set -e
branch=${1:-main}
git add -A
git commit -m "chore: deploy $(date +%F' '%T)"
git push -u origin "$branch"
EOF
chmod +x deploy.sh
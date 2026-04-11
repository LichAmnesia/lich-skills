#!/usr/bin/env bash
# Install git hooks for lich-skills.
#
# Usage: ./scripts/install-hooks.sh
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_SRC="${REPO_ROOT}/scripts/pre-commit"
HOOK_DST="${REPO_ROOT}/.git/hooks/pre-commit"

if [ ! -f "${HOOK_SRC}" ]; then
  echo "Missing ${HOOK_SRC}" >&2
  exit 1
fi

chmod +x "${HOOK_SRC}"
ln -sf "../../scripts/pre-commit" "${HOOK_DST}"

echo "Installed pre-commit hook -> ${HOOK_DST}"
echo "Test it with: gitleaks detect --config .gitleaks.toml --source . --verbose"

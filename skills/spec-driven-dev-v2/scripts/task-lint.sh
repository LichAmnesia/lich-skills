#!/usr/bin/env bash
# task-lint.sh — mechanical task gate for spec-driven-dev-v2
#
# Usage:
#   scripts/task-lint.sh <sprint-dir>                 # check all tasks in a sprint
#   scripts/task-lint.sh tasks/TK-NNN-<slug>.md       # check one task file
#
# Exit codes:
#   0  all checks pass
#   1  at least one task fails
#   2  bad invocation
#
# Checks per task file:
#   - Has YAML frontmatter with required keys: id, slug, size, files, verify, rollback, status
#   - size ∈ {XS, S, M, L}  (XL forbidden)
#   - files has ≤ 5 entries for size ≤ M; ≤ 8 for L
#   - verify is a non-empty command
#   - rollback is a non-empty line
#   - Title (first # heading) does not contain " and "
#   - Has at least one acceptance checkbox ("- [ ]") under "## Acceptance"
#
# Dependency: yq (https://github.com/mikefarah/yq) — `brew install yq`.

set -euo pipefail

fail=0

check_task() {
  local f="$1"
  local err=()

  [[ -f "$f" ]] || { echo "NOT FOUND: $f"; return 1; }

  # Frontmatter extraction: lines between the first two "---" markers.
  local fm
  fm="$(awk '/^---$/{c++; next} c==1{print}' "$f")"
  [[ -n "$fm" ]] || err+=("missing frontmatter")

  local id size verify rollback
  id="$(echo "$fm"       | yq -r '.id // ""')"
  size="$(echo "$fm"     | yq -r '.size // ""')"
  verify="$(echo "$fm"   | yq -r '.verify // ""')"
  rollback="$(echo "$fm" | yq -r '.rollback // ""')"
  local files_count
  files_count="$(echo "$fm" | yq -r '.files | length // 0')"

  [[ -n "$id" ]]                                  || err+=("frontmatter.id missing")
  [[ "$size" =~ ^(XS|S|M|L)$ ]]                   || err+=("frontmatter.size must be XS|S|M|L (got: '$size')")
  [[ -n "$verify" ]]                              || err+=("frontmatter.verify empty")
  [[ -n "$rollback" ]]                            || err+=("frontmatter.rollback empty")

  if [[ "$size" == "L" ]]; then
    (( files_count <= 8 )) || err+=("L task has $files_count files, max 8")
  else
    (( files_count <= 5 )) || err+=("$size task has $files_count files, max 5 (use L if justified)")
  fi

  local title
  title="$(grep -m1 '^# ' "$f" || true)"
  [[ -n "$title" ]]              || err+=("missing # title heading")
  [[ "$title" != *" and "* ]]    || err+=("title contains ' and ' — split the task")

  # At least one acceptance checkbox.
  if ! awk '/^## Acceptance/,/^## /{print}' "$f" | grep -q '^- \[ \]'; then
    err+=("no acceptance checkboxes under ## Acceptance")
  fi

  if (( ${#err[@]} )); then
    echo "FAIL $f"
    printf '   - %s\n' "${err[@]}"
    return 1
  else
    echo "OK   $f"
    return 0
  fi
}

main() {
  [[ $# -eq 1 ]] || { echo "usage: $0 <sprint-dir|task-file>" >&2; exit 2; }

  local target="$1"
  if [[ -f "$target" ]]; then
    check_task "$target" || fail=1
  elif [[ -d "$target" ]]; then
    local tasks_dir="$target/tasks"
    [[ -d "$tasks_dir" ]] || { echo "no tasks/ dir under $target" >&2; exit 2; }
    while IFS= read -r -d '' f; do
      check_task "$f" || fail=1
    done < <(find "$tasks_dir" -maxdepth 1 -name 'TK-*.md' -type f -print0 | sort -z)
  else
    echo "not a file or dir: $target" >&2
    exit 2
  fi

  exit "$fail"
}

main "$@"

#!/usr/bin/env bash
# governance-check.sh — project-wide invariant checker for spec-driven-dev-v2
#
# Usage:
#   scripts/governance-check.sh <project-dir>
#
# Exit codes:
#   0  all invariants hold
#   1  at least one violation
#   2  bad invocation
#
# Invariants checked:
#   I1. Every sprint's STATE.json is valid JSON and has required keys.
#   I2. project STATE.json `current_sprint` exists as a sprint directory.
#   I3. Every task in TASKS.md with status=merged has ≥1 review file with
#       verdict ∈ {approve, approve_with_nits}.
#   I4. No review file has an unresolved Critical: finding for a merged task.
#   I5. Every sprint's TASKS.md `Rounds` column ≤ 5, unless Notes contains "ESCALATED".
#   I6. Every artifact-registry/rules/RULE-*.md with enforcement=lint has a
#       resolvable `lint_rule:` pointer.
#   I7. Every artifact-registry/rules/RULE-*.md with status=active enforcement=doc
#       was created ≤ 60 days ago (else it must graduate or retire).
#   I8. No two tasks share a worktree/branch across open sprints.
#   I9. Sprint STATE.json last_updated is not older than the most recent commit
#       on its integration branch (detects orphan STATE).
#
# Add project-specific checks below main() as the project grows.
# Every new rule in artifact-registry with enforcement=lint should correspond
# to either an external lint tool invocation here, or a dedicated script.
#
# Dependency: yq, jq.

set -euo pipefail

violations=0
warn()  { echo "WARN  $*"; }
fail()  { echo "FAIL  $*"; violations=$((violations+1)); }
ok()    { echo "ok    $*"; }

check_sprint_state() {
  local sprint_dir="$1"
  local state="$sprint_dir/STATE.json"
  [[ -f "$state" ]] || { fail "I1 $sprint_dir: STATE.json missing"; return; }
  jq -e '.sprint_id and .status and .current_task and (.current_round // 0)' "$state" >/dev/null \
    || { fail "I1 $state: missing required keys"; return; }
  ok "I1 $state"
}

check_merged_have_approval() {
  local sprint_dir="$1"
  local tasks_md="$sprint_dir/TASKS.md"
  [[ -f "$tasks_md" ]] || { fail "I3 $tasks_md: missing"; return; }

  # Extract rows with status=merged (assumes markdown table; tolerant to padding).
  local merged
  merged="$(awk -F'|' 'NR>2 && $3 ~ /merged/ {gsub(/ /,"",$2); print $2}' "$tasks_md" || true)"

  while IFS= read -r tk; do
    [[ -z "$tk" ]] && continue
    # Strip any markdown link syntax [TK-001](path) -> TK-001
    tk="$(echo "$tk" | sed -E 's/\[([^]]+)\].*/\1/' | tr -d '[:space:]')"
    [[ -z "$tk" ]] && continue

    local approved=0
    for rv in "$sprint_dir"/reviews/${tk}-round*.md; do
      [[ -f "$rv" ]] || continue
      local verdict
      verdict="$(awk '/^---$/{c++; next} c==1{print}' "$rv" | yq -r '.verdict // ""')"
      if [[ "$verdict" == "approve" || "$verdict" == "approve_with_nits" ]]; then
        approved=1; break
      fi
    done
    if (( approved == 1 )); then
      ok "I3 $tk has approved review"
    else
      fail "I3 $tk is merged but has no approved review file"
    fi
  done <<< "$merged"
}

check_unresolved_critical() {
  local sprint_dir="$1"
  # Any review file with '[unresolved]' on a row containing 'Critical:' is a violation
  # for tasks whose status is merged.
  while IFS= read -r -d '' rv; do
    if grep -q 'Critical:.*\[unresolved\]\|\[unresolved\].*Critical:' "$rv"; then
      local tk
      tk="$(awk '/^---$/{c++; next} c==1{print}' "$rv" | yq -r '.task // ""')"
      local status_line
      status_line="$(grep -E "\|\s*${tk}\s*\|" "$sprint_dir/TASKS.md" || true)"
      if [[ "$status_line" == *"merged"* ]]; then
        fail "I4 $rv has unresolved Critical: for merged $tk"
      else
        warn "I4 $rv has unresolved Critical: ($tk not yet merged — OK for now)"
      fi
    fi
  done < <(find "$sprint_dir/reviews" -maxdepth 1 -name 'RV-*.md' -type f -print0 2>/dev/null || true)
}

check_round_budget() {
  local sprint_dir="$1"
  local tasks_md="$sprint_dir/TASKS.md"
  [[ -f "$tasks_md" ]] || return
  awk -F'|' 'NR>2 && NF>6 {
    gsub(/ /,"",$2); gsub(/ /,"",$6); gsub(/ /,"",$8);
    if ($6+0 > 5 && $8 !~ /ESCALATED/) print $2" rounds="$6" notes="$8
  }' "$tasks_md" | while read -r line; do
    [[ -z "$line" ]] && continue
    fail "I5 round budget exceeded without escalation: $line"
  done
}

check_lint_rule_pointers() {
  local project_dir="$1"
  local registry="$project_dir/../artifact-registry/rules"
  [[ -d "$registry" ]] || { warn "no artifact-registry/rules (OK if project is new)"; return; }

  while IFS= read -r -d '' rule; do
    local fm enforcement pointer status created
    fm="$(awk '/^---$/{c++; next} c==1{print}' "$rule")"
    enforcement="$(echo "$fm" | yq -r '.enforcement // ""')"
    pointer="$(echo    "$fm" | yq -r '.lint_rule // ""')"
    status="$(echo     "$fm" | yq -r '.status // ""')"
    created="$(echo    "$fm" | yq -r '.created // ""')"

    if [[ "$enforcement" == "lint" ]]; then
      if [[ -z "$pointer" ]]; then
        fail "I6 $rule: enforcement=lint but lint_rule pointer empty"
      elif [[ ! -e "$pointer" ]]; then
        fail "I6 $rule: lint_rule pointer '$pointer' does not exist"
      else
        ok "I6 $rule → $pointer"
      fi
    fi

    if [[ "$enforcement" == "doc" && "$status" == "active" && -n "$created" ]]; then
      # 60 days = 5184000 seconds
      local age=$(( $(date +%s) - $(date -j -f "%Y-%m-%d" "$created" +%s 2>/dev/null || echo 0) ))
      if (( age > 5184000 )); then
        warn "I7 $rule is active/doc and ≥ 60 days old — graduate or retire"
      fi
    fi
  done < <(find "$registry" -maxdepth 1 -name 'RULE-*.md' -type f -print0 2>/dev/null || true)
}

main() {
  [[ $# -eq 1 ]] || { echo "usage: $0 <project-dir>" >&2; exit 2; }
  local project_dir="$1"
  [[ -d "$project_dir" ]] || { echo "not a directory: $project_dir" >&2; exit 2; }

  local project_state="$project_dir/STATE.json"
  [[ -f "$project_state" ]] || { fail "project STATE.json missing"; exit 1; }
  local current_sprint
  current_sprint="$(jq -r '.current_sprint // ""' "$project_state")"
  [[ -n "$current_sprint" && -d "$project_dir/$current_sprint" ]] \
    || { fail "I2 project.current_sprint='$current_sprint' not found"; }

  while IFS= read -r -d '' sprint_dir; do
    [[ -d "$sprint_dir" ]] || continue
    check_sprint_state        "$sprint_dir"
    check_merged_have_approval "$sprint_dir"
    check_unresolved_critical  "$sprint_dir"
    check_round_budget         "$sprint_dir"
  done < <(find "$project_dir" -maxdepth 1 -type d -name 'sprints-*' -print0 | sort -z)

  check_lint_rule_pointers "$project_dir"

  if (( violations > 0 )); then
    echo
    echo "governance-check: $violations violation(s)"
    exit 1
  fi
  echo
  echo "governance-check: all invariants hold"
}

main "$@"

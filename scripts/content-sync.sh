#!/usr/bin/env bash
# content-sync.sh: the mechanical parts of
# context-v/reminders/Fetching-Content-Updates-is-Multi-Step-Multi-Module.md
#
#   status            (default) report every repo in the content chain:
#                     branch, dirty tree, ahead/behind origin/development,
#                     and whether origin development == main == master.
#   pull              step 4: fast-forward the site's copy of the content
#                     (src/generated-content and its content-areas) to
#                     origin/development. Refuses on a dirty or detached repo.
#   promote <path>    step 3: fast-forward origin/main and origin/master to
#                     origin/development for the repo at <path>. Refuses if
#                     either has commits development doesn't. Never forces.
#
# Commits are left to you: the script never runs `git commit`.

set -euo pipefail

SITE="$(cd "$(dirname "$0")/.." && pwd)"
MONO="$(cd "$SITE/.." && pwd)"

# The chain, authoring side first. Uninitialized submodules are skipped.
CHAIN=(
  "$MONO/content/content-areas"
  "$MONO/content/projects/Water-Template-CE"
  "$MONO/content/client-content"
  "$MONO/content"
  "$SITE/src/generated-content/content-areas"
  "$SITE/src/generated-content"
  "$SITE"
)

is_repo() { git -C "$1" rev-parse --git-dir >/dev/null 2>&1 && [ -n "$(command ls -A "$1" 2>/dev/null)" ]; }
rel() { echo "${1#"$MONO"/}"; }
sha() { git -C "$1" rev-parse --short "$2" 2>/dev/null || echo "-"; }

status_one() {
  local repo="$1" branch dirty ab dev main master parity
  git -C "$repo" fetch --quiet origin 2>/dev/null || echo "  (fetch failed)"
  branch="$(git -C "$repo" branch --show-current)"
  [ -z "$branch" ] && branch="DETACHED@$(sha "$repo" HEAD)"
  dirty="clean"; [ -n "$(git -C "$repo" status --porcelain --ignore-submodules=dirty)" ] && dirty="DIRTY"
  ab="$(git -C "$repo" rev-list --left-right --count HEAD...origin/development 2>/dev/null | awk '{print "ahead "$1", behind "$2}')"
  dev="$(sha "$repo" origin/development)"; main="$(sha "$repo" origin/main)"; master="$(sha "$repo" origin/master)"
  if [ "$dev" = "$main" ] && [ "$dev" = "$master" ]; then parity="in parity"; else parity="NOT in parity"; fi
  printf '%s\n  branch %s · %s · %s vs origin/development\n  origin dev %s · main %s · master %s (%s)\n' \
    "$(rel "$repo")" "$branch" "$dirty" "${ab:-no origin/development}" "$dev" "$main" "$master" "$parity"
}

cmd_status() {
  for repo in "${CHAIN[@]}"; do
    if is_repo "$repo"; then status_one "$repo"; else echo "$(rel "$repo")"; echo "  (not initialized, skipped)"; fi
  done
}

pull_one() {
  local repo="$1"
  [ -n "$(git -C "$repo" status --porcelain --ignore-submodules=all)" ] && { echo "refusing: $(rel "$repo") has uncommitted changes" >&2; exit 1; }
  if [ "$(git -C "$repo" branch --show-current)" != "development" ]; then
    git -C "$repo" switch development
  fi
  # No submodule recursion: the site leaves private submodules (client-content)
  # uninitialized, and on-demand fetch into them aborts the pull.
  git -C "$repo" pull --ff-only --no-recurse-submodules origin development
}

cmd_pull() {
  local gc="$SITE/src/generated-content"
  pull_one "$gc"
  if ! is_repo "$gc/content-areas"; then
    git -C "$gc" submodule update --init content-areas
  fi
  pull_one "$gc/content-areas"
  echo
  git -C "$gc" status --short
  echo "generated-content now at $(sha "$gc" HEAD). If the site shows a changed gitlink, commit it:"
  echo "  git add src/generated-content && git commit -m \"chore(submodule): bump generated-content to $(sha "$gc" HEAD)\""
}

cmd_promote() {
  local repo="${1:?usage: content-sync.sh promote <repo-path>}"
  repo="$(cd "$repo" && pwd)"
  git -C "$repo" fetch origin
  for b in main master; do
    if ! git -C "$repo" merge-base --is-ancestor "origin/$b" origin/development; then
      echo "refusing: origin/$b in $(rel "$repo") has commits development doesn't. Reconcile by hand." >&2
      exit 1
    fi
  done
  # Push exactly what was checked (origin/development), never the local branch, which may hold unpushed commits
  git -C "$repo" push origin refs/remotes/origin/development:refs/heads/main refs/remotes/origin/development:refs/heads/master
}

case "${1:-status}" in
  status)  cmd_status ;;
  pull)    cmd_pull ;;
  promote) shift; cmd_promote "$@" ;;
  *) sed -n '2,17p' "$0"; exit 1 ;;
esac

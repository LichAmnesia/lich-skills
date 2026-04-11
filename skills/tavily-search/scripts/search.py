#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "httpx>=0.27.0",
# ]
# ///
"""
Tavily Search / Extract CLI.

Usage:
    uv run search.py "query" [flags]
    uv run search.py --extract https://example.com/article

Environment:
    TAVILY_API_KEY (required, unless --api-key is passed)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any

import httpx

SEARCH_URL = "https://api.tavily.com/search"
EXTRACT_URL = "https://api.tavily.com/extract"
DEFAULT_TIMEOUT = 30.0


def get_api_key(provided: str | None) -> str | None:
    if provided:
        return provided
    return os.environ.get("TAVILY_API_KEY") or os.environ.get("TAVILY_KEY")


def parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def do_search(api_key: str, args: argparse.Namespace) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "api_key": api_key,
        "query": args.query,
        "search_depth": args.depth,
        "max_results": args.max_results,
        "include_answer": True,
        "include_raw_content": args.raw_content,
    }

    if args.topic:
        payload["topic"] = args.topic
    if args.days is not None:
        payload["days"] = args.days

    include = parse_csv(args.include_domains)
    exclude = parse_csv(args.exclude_domains)
    if include:
        payload["include_domains"] = include
    if exclude:
        payload["exclude_domains"] = exclude

    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        response = client.post(SEARCH_URL, json=payload)
        response.raise_for_status()
        return response.json()


def do_extract(api_key: str, url: str) -> dict[str, Any]:
    payload = {
        "api_key": api_key,
        "urls": [url],
        "include_images": False,
        "extract_depth": "advanced",
    }
    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        response = client.post(EXTRACT_URL, json=payload)
        response.raise_for_status()
        return response.json()


def render_search_text(data: dict[str, Any]) -> str:
    lines: list[str] = []
    answer = data.get("answer")
    if answer:
        lines.append(f"ANSWER: {answer}")
        lines.append("")

    results = data.get("results") or []
    if not results:
        lines.append("No results.")
        return "\n".join(lines)

    lines.append("RESULTS:")
    for i, result in enumerate(results, start=1):
        title = result.get("title") or "(untitled)"
        url = result.get("url") or ""
        content = (result.get("content") or "").strip()
        lines.append(f"[{i}] {title}")
        if url:
            lines.append(f"    {url}")
        if content:
            lines.append(f"    {content}")
        raw = (result.get("raw_content") or "").strip()
        if raw:
            lines.append("")
            for raw_line in raw.splitlines():
                lines.append(f"    {raw_line}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def render_extract_text(data: dict[str, Any]) -> str:
    results = data.get("results") or []
    if not results:
        failed = data.get("failed_results") or []
        if failed:
            return f"Extract failed: {failed}\n"
        return "No content extracted.\n"

    parts: list[str] = []
    for result in results:
        url = result.get("url") or ""
        body = (result.get("raw_content") or "").strip()
        parts.append(f"# {url}\n\n{body}\n")
    return "\n".join(parts)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Tavily Search / Extract CLI",
    )
    parser.add_argument("query", nargs="?", help="Search query")
    parser.add_argument("--extract", metavar="URL", help="Extract a single URL instead of searching")
    parser.add_argument("--api-key", help="Tavily API key (overrides TAVILY_API_KEY)")
    parser.add_argument("--max-results", type=int, default=5)
    parser.add_argument(
        "--depth",
        choices=("basic", "advanced"),
        default="basic",
        help="Search depth (advanced = slower, higher quality)",
    )
    parser.add_argument(
        "--topic",
        choices=("general", "news"),
        help="Search topic (news adds recency filtering)",
    )
    parser.add_argument("--days", type=int, help="Restrict to last N days (news topic only)")
    parser.add_argument("--raw-content", action="store_true", help="Include full article body")
    parser.add_argument("--include-domains", help="Comma-separated allowlist")
    parser.add_argument("--exclude-domains", help="Comma-separated blocklist")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")

    args = parser.parse_args()

    if not args.query and not args.extract:
        parser.error("Provide a query or --extract URL")

    api_key = get_api_key(args.api_key)
    if not api_key:
        print("Error: No TAVILY_API_KEY. Set env var or pass --api-key.", file=sys.stderr)
        return 1

    try:
        if args.extract:
            data = do_extract(api_key, args.extract)
            output = json.dumps(data, indent=2, ensure_ascii=False) if args.json else render_extract_text(data)
        else:
            data = do_search(api_key, args)
            output = json.dumps(data, indent=2, ensure_ascii=False) if args.json else render_search_text(data)
    except httpx.HTTPStatusError as exc:
        body = exc.response.text[:500]
        print(f"Error: {exc.response.status_code} {exc.response.reason_phrase}\n{body}", file=sys.stderr)
        return 2
    except httpx.HTTPError as exc:
        print(f"Error: network failure: {exc}", file=sys.stderr)
        return 2

    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

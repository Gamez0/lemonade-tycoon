"""Read the live project queue. Requires authenticated gh with project scope.

python scripts/github-backlog.py --next
python scripts/github-backlog.py --all --json
This command is read-only; issue details remain the acceptance criteria.
"""
import argparse
import collections
import json
import subprocess
import sys

OWNER = "Gamez0"
REPOSITORY = "Gamez0/lemonade-tycoon"
PROJECT_NUMBER = 2
NEXT_VIEW_NUMBER = 6
QUERY = """query($owner:String!,$number:Int!,$cursor:String){
  user(login:$owner){projectV2(number:$number){url items(first:100,after:$cursor){
    pageInfo{hasNextPage endCursor}
    nodes{id isArchived content{
      __typename
      ...on Issue{number title url state repository{nameWithOwner} labels(first:50){nodes{name}}}
      ...on PullRequest{number title url state repository{nameWithOwner} labels(first:50){nodes{name}}}
    } fieldValues(first:50){nodes{
      ...on ProjectV2ItemFieldSingleSelectValue{name field{...on ProjectV2SingleSelectField{name}}}
      ...on ProjectV2ItemFieldNumberValue{number field{...on ProjectV2Field{name}}}
      ...on ProjectV2ItemFieldTextValue{text field{...on ProjectV2Field{name}}}
    }}}
  }}}
}"""


def read_queue():
    cursor = None
    rows = []
    while True:
        request = dict(query=QUERY, variables=dict(owner=OWNER, number=PROJECT_NUMBER, cursor=cursor))
        result = subprocess.run(["gh", "api", "graphql", "--input", "-"], input=json.dumps(request),
                                capture_output=True, text=True, encoding="utf-8")
        if result.returncode:
            raise RuntimeError(result.stderr.strip() or result.stdout.strip())
        response = json.loads(result.stdout)
        if response.get("errors"):
            raise RuntimeError(str(response["errors"]))
        project = response["data"]["user"]["projectV2"]
        if not project:
            raise RuntimeError("Project is unavailable; check the authenticated account and project permission.")
        for item in project["items"]["nodes"]:
            if item["isArchived"]:
                continue
            content = item.get("content")
            if not content or content.get("state") != "OPEN" or content["repository"]["nameWithOwner"] != REPOSITORY:
                continue
            fields = {}
            for value in item["fieldValues"]["nodes"]:
                if "field" not in value:
                    continue
                fields[value["field"]["name"]] = next(value[key] for key in ("name", "number", "text") if key in value)
            labels = [label["name"] for label in content["labels"]["nodes"]]
            rows.append(dict(number=content["number"], title=content["title"], url=content["url"],
                             kind=content["__typename"], item_id=item["id"], execution=fields.get("Execution", "Unclassified"),
                             priority=fields.get("Priority", "P2"), order=fields.get("Order", 9999),
                             next_action=fields.get("Next action", ""), blocked_by=fields.get("Blocked by", ""),
                             tracker="type:tracker" in labels))
        page = project["items"]["pageInfo"]
        if not page["hasNextPage"]:
            return project["url"], rows
        cursor = page["endCursor"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--next", action="store_true", help="Resume Running, otherwise select the first Ready issue")
    group.add_argument("--all", action="store_true", help="Include manual, deferred, blocked, legacy and PR entries")
    parser.add_argument("--json", action="store_true", help="Return structured output")
    parser.add_argument("--check", action="store_true", help="Check that every open repository issue is classified on the board")
    args = parser.parse_args()
    project, rows = read_queue()
    issues = [row for row in rows if row["kind"] == "Issue" and not row["tracker"]]
    if args.check:
        result = subprocess.run(["gh", "api", "--paginate", "--slurp",
                                 f"repos/{REPOSITORY}/issues?state=open&per_page=100"],
                                capture_output=True, text=True, encoding="utf-8")
        if result.returncode:
            raise RuntimeError(result.stderr.strip())
        remote = [issue for page in json.loads(result.stdout) for issue in page if "pull_request" not in issue]
        tracked = {row["url"] for row in rows if row["kind"] == "Issue"}
        missing = [issue["number"] for issue in remote if issue["html_url"] not in tracked]
        unclassified = [row["number"] for row in rows if row["execution"] == "Unclassified"]
        if missing or unclassified:
            raise RuntimeError(f"Backlog needs triage. Missing issues: {missing}; unclassified items: {unclassified}")
    counts = dict(collections.Counter(row["execution"] for row in issues))
    running = [row for row in issues if row["execution"] == "Running"]
    ready = [row for row in issues if row["execution"] == "Ready"]
    key = lambda row: (row["order"], row["number"])
    if args.next:
        selected = sorted(running or ready, key=key)[:1]
    else:
        selected = sorted(rows if args.all else running + ready, key=key)
    if args.json:
        print(json.dumps(dict(project=project, next_view=f"{project}/views/{NEXT_VIEW_NUMBER}", counts=counts, items=selected), ensure_ascii=False, indent=2))
    else:
        print(f"{project}/views/{NEXT_VIEW_NUMBER}" if args.next else project)
        print(" / ".join(f"{name}: {count}" for name, count in sorted(counts.items())))
        for row in selected:
            print(f"[{row['execution']}] {row['priority']} #{row['number']} {row['title']}\n{row['url']}")
            print(f"Next: {row['next_action']}")
            if row["blocked_by"]:
                print(f"Blocked by: {row['blocked_by']}")
        if not selected:
            print("No Running/Ready issue. Inspect documented blockers and approved backlog; do not invent new scope.")


if __name__ == "__main__":
    # Keep redirected Windows output readable by terminals and API clients.
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    try:
        main()
    except (OSError, ValueError, KeyError, RuntimeError) as error:
        print(f"Cannot read GitHub backlog: {error}", file=sys.stderr)
        raise SystemExit(1)

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [repoRes, runsRes] = await Promise.all([
      fetch("https://api.github.com/repos/tevateva21-hash/vstsplugin", {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
      }),
      fetch(
        "https://api.github.com/repos/tevateva21-hash/vstsplugin/actions/runs?status=success&per_page=1",
        {
          headers: { Accept: "application/vnd.github+json" },
          cache: "no-store",
        }
      ),
    ]);

    const repoData = repoRes.ok
      ? ((await repoRes.json()) as {
          pushed_at?: string;
          stargazers_count?: number;
          html_url?: string;
        })
      : null;

    const runsData = runsRes.ok
      ? ((await runsRes.json()) as {
          workflow_runs?: {
            id: number;
            html_url: string;
            head_commit?: { message?: string };
            updated_at?: string;
          }[];
        })
      : null;

    const latestRun = runsData?.workflow_runs?.[0] ?? null;

    return NextResponse.json({
      ok: true,
      repoUrl:
        repoData?.html_url ?? "https://github.com/tevateva21-hash/vstsplugin",
      pushedAt: repoData?.pushed_at ?? null,
      latestBuildUrl:
        latestRun?.html_url ??
        "https://github.com/tevateva21-hash/vstsplugin/actions",
      latestBuildCommit: latestRun?.head_commit?.message ?? null,
      latestBuildDate: latestRun?.updated_at ?? null,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      repoUrl: "https://github.com/tevateva21-hash/vstsplugin",
      latestBuildUrl: "https://github.com/tevateva21-hash/vstsplugin/actions",
    });
  }
}

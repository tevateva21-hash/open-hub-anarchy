import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const CACHE_DIR = "/tmp/anarchy-radio-cache";

function isSafeDriveId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{10,80}$/.test(id);
}

async function ensureCachedAudioFile(id: string): Promise<string | null> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  const targetPath = path.join(CACHE_DIR, `${id}.wav`);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1024) {
    return targetPath;
  }

  const tmpPath = `${targetPath}.tmp`;
  try {
    await execFileAsync(
      "gdrive",
      ["readonly", "download", id, "--out", tmpPath],
      { timeout: 60000 }
    );
    if (fs.existsSync(tmpPath) && fs.statSync(tmpPath).size > 1024) {
      fs.renameSync(tmpPath, targetPath);
      return targetPath;
    }
  } catch {
    if (fs.existsSync(tmpPath)) {
      try {
        fs.unlinkSync(tmpPath);
      } catch {
        // ignore
      }
    }
  }

  return null;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  if (!isSafeDriveId(id)) {
    return NextResponse.json({ error: "Invalid Drive ID" }, { status: 400 });
  }

  const cachedPath = await ensureCachedAudioFile(id);

  if (cachedPath) {
    const stat = fs.statSync(cachedPath);
    const total = stat.size;
    const range = req.headers.get("range");

    if (range) {
      const match = range.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = Number(match[1]);
        const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
        if (start >= total || end < start) {
          return new NextResponse(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${total}` },
          });
        }
        const chunkSize = end - start + 1;
        const stream = fs.createReadStream(cachedPath, { start, end });
        const webStream = new ReadableStream({
          start(controller) {
            stream.on("data", (chunk) => controller.enqueue(chunk));
            stream.on("end", () => controller.close());
            stream.on("error", (err) => controller.error(err));
          },
          cancel() {
            stream.destroy();
          },
        });

        return new NextResponse(webStream, {
          status: 206,
          headers: {
            "Content-Type": "audio/wav",
            "Content-Length": String(chunkSize),
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    const stream = fs.createReadStream(cachedPath);
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(total),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // Fallback redirection vers Drive si le cache local CLI n'est pas disponible
  return NextResponse.redirect(
    `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`
  );
}

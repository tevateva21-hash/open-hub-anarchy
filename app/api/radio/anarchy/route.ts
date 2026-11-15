import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

const ANARCHY_SONS_FOLDER_ID = "1RsO_5aocVS-2ihr6uAzUCWmaV0nFVMVF";

interface DriveRadioTrack {
  id: string;
  name: string;
  title: string;
  mimeType: string;
  sizeLabel: string;
  streamUrl: string;
  driveUrl: string;
}

const FALLBACK_SONS_TRACKS: Omit<DriveRadioTrack, "streamUrl" | "driveUrl">[] = [
  {
    id: "1X9xsOqjso_wuK2PX5Hyr8HUuEj3yz7MR",
    name: "Anarchy.wav",
    title: "Anarchy",
    mimeType: "audio/wav",
    sizeLabel: "58.3 MB",
  },
  {
    id: "1kCdATeyppoK39nd3hap-hXQPr3YSBEnx",
    name: "POWER GLOVE REMIX.wav",
    title: "POWER GLOVE REMIX",
    mimeType: "audio/wav",
    sizeLabel: "38.3 MB",
  },
  {
    id: "1Om8QOq2avKSDmCcsl8l8Xe-fgzH8rFVp",
    name: "psychedelic trap.wav",
    title: "psychedelic trap",
    mimeType: "audio/wav",
    sizeLabel: "48.2 MB",
  },
  {
    id: "14AP_M91GRmzig5NoKPvUi-p7_CBSQCn7",
    name: "PSYCHEDELIC VIBE.wav",
    title: "PSYCHEDELIC VIBE",
    mimeType: "audio/wav",
    sizeLabel: "47.7 MB",
  },
  {
    id: "1P8lOsbuX7W4KKNKy0wL87xWcn8jRwKTJ",
    name: "tribal -136.wav",
    title: "tribal -136",
    mimeType: "audio/wav",
    sizeLabel: "38.0 MB",
  },
];

function stripAudioExtension(filename: string): string {
  return filename.replace(/\.(wav|mp3|ogg|flac|m4a|aac|aiff)$/i, "").trim();
}

function parseGdriveLsOutput(stdout: string): DriveRadioTrack[] {
  const lines = stdout
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const tracks: DriveRadioTrack[] = [];
  for (const line of lines) {
    if (
      line.startsWith("ID") ||
      line.startsWith("--") ||
      !line.includes("audio/")
    ) {
      continue;
    }
    // Format: <ID>  <Name>  audio/<ext>  <Size>
    const match = line.match(
      /^(\S+)\s+(.+?)\s+(audio\/\S+)\s+(.+)$/
    );
    if (!match) continue;
    const [, id, name, mimeType, sizeLabel] = match;
    tracks.push({
      id: id.trim(),
      name: name.trim(),
      title: stripAudioExtension(name.trim()),
      mimeType: mimeType.trim(),
      sizeLabel: sizeLabel.trim(),
      streamUrl: `/api/radio/anarchy/stream/${encodeURIComponent(id.trim())}`,
      driveUrl: `https://drive.google.com/file/d/${encodeURIComponent(id.trim())}/view`,
    });
  }
  return tracks;
}

export async function GET() {
  const syncedAt = new Date().toISOString();

  // 1. Essayer le listing live via gdrive CLI (connecté dans la VM)
  try {
    const { stdout } = await execFileAsync(
      "gdrive",
      ["readonly", "ls", ANARCHY_SONS_FOLDER_ID],
      { timeout: 10000 }
    );
    const liveTracks = parseGdriveLsOutput(stdout);
    if (liveTracks.length > 0) {
      return NextResponse.json({
        source: "gdrive_live",
        folderId: ANARCHY_SONS_FOLDER_ID,
        syncedAt,
        tracks: liveTracks,
      });
    }
  } catch {
    // Fallback si gdrive CLI indisponible (ex: Vercel)
  }

  // 2. Fallback API Google Drive publique si GOOGLE_DRIVE_API_KEY est configurée
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (apiKey) {
    try {
      const q = encodeURIComponent(
        `'${ANARCHY_SONS_FOLDER_ID}' in parents and trashed = false`
      );
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size)&key=${encodeURIComponent(apiKey)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          files?: { id: string; name: string; mimeType: string; size?: string }[];
        };
        const audioFiles = (data.files ?? []).filter((f) =>
          f.mimeType?.startsWith("audio/")
        );
        if (audioFiles.length > 0) {
          return NextResponse.json({
            source: "gdrive_api",
            folderId: ANARCHY_SONS_FOLDER_ID,
            syncedAt,
            tracks: audioFiles.map((f) => ({
              id: f.id,
              name: f.name,
              title: stripAudioExtension(f.name),
              mimeType: f.mimeType,
              sizeLabel: f.size
                ? `${(Number(f.size) / (1024 * 1024)).toFixed(1)} MB`
                : "AUDIO",
              streamUrl: `/api/radio/anarchy/stream/${encodeURIComponent(f.id)}`,
              driveUrl: `https://drive.google.com/file/d/${encodeURIComponent(f.id)}/view`,
            })),
          });
        }
      }
    } catch {
      // Fallback vers le manifeste
    }
  }

  // 3. Fallback manifeste connu du dossier Drive Sons
  return NextResponse.json({
    source: "drive_manifest",
    folderId: ANARCHY_SONS_FOLDER_ID,
    syncedAt,
    tracks: FALLBACK_SONS_TRACKS.map((t) => ({
      ...t,
      streamUrl: `/api/radio/anarchy/stream/${encodeURIComponent(t.id)}`,
      driveUrl: `https://drive.google.com/file/d/${encodeURIComponent(t.id)}/view`,
    })),
  });
}

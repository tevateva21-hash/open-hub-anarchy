import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!groqKey && !openaiKey) {
      return NextResponse.json(
        {
          error:
            "Clé API Whisper manquante sur le serveur. Ajoutez GROQ_API_KEY ou OPENAI_API_KEY dans votre .env.local / Vercel pour activer la transcription automatique.",
          needsApiKey: true,
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const language = (formData.get("language") as string | null) || "fr";

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Fichier audio manquant dans la requête." },
        { status: 400 }
      );
    }

    const upstreamForm = new FormData();
    upstreamForm.append("file", file, "extract-16k.wav");
    upstreamForm.append("response_format", "verbose_json");
    upstreamForm.append("timestamp_granularities[]", "word");
    upstreamForm.append("timestamp_granularities[]", "segment");
    if (language && language !== "auto") {
      upstreamForm.append("language", language);
    }

    const useGroq = Boolean(groqKey);
    const endpoint = useGroq
      ? "https://api.groq.com/openai/v1/audio/transcriptions"
      : "https://api.openai.com/v1/audio/transcriptions";
    upstreamForm.append("model", useGroq ? "whisper-large-v3" : "whisper-1");

    const upstreamRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useGroq ? groqKey : openaiKey}`,
      },
      body: upstreamForm,
    });

    const data = await upstreamRes.json();
    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            `Erreur Whisper (${upstreamRes.status})`,
        },
        { status: upstreamRes.status }
      );
    }

    return NextResponse.json({
      provider: useGroq ? "groq-whisper-large-v3" : "openai-whisper-1",
      text: data.text ?? "",
      segments: Array.isArray(data.segments) ? data.segments : [],
      words: Array.isArray(data.words) ? data.words : [],
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erreur interne lors de la transcription Whisper.",
      },
      { status: 500 }
    );
  }
}

import { getSupabaseClient } from "@/lib/supabase";

/**
 * Envoie un fichier (avatar, audio, stems .zip, .vst3) vers le bucket Supabase `openhub-media`.
 * Retourne l'URL publique si Supabase est prêt, ou `null` pour basculer sur le fallback local.
 */
export async function uploadToOpenHubStorage(
  file: File,
  folder: "avatars" | "audio" | "stems" | "vst" | "samples"
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("openhub-media")
      .upload(path, file, { upsert: true });

    if (error) return null;

    const { data } = supabase.storage.from("openhub-media").getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

import { redirect } from "next/navigation";

/**
 * Redirection propre de l'ancienne route `/visual-engine` vers `/anarchy-visual-design`.
 */
export default function VisualEngineRedirectPage() {
  redirect("/anarchy-visual-design");
}

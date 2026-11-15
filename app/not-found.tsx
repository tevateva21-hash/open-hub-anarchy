import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";

/**
 * Page 404 personnalisée — Style Clinique DAW + Spectateur BD 3D.
 */
export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto py-12">
      <Card
        moduleTitle="ERR_404 // SIGNAL_NOT_FOUND"
        moduleMeta="BUS_ROUTING_FAULT"
        activeIndicator
      >
        <div className="flex flex-col items-center text-center space-y-5 py-4">
          <AvatarBD name="Signal Perdu 3D" size="xl" badgeText="404" />
          <div className="space-y-2">
            <h1 className="font-mono text-2xl font-bold text-brand-black">
              {"404 // PISTE AUDIO INTROUVABLE"}
            </h1>
            <p className="text-sm text-neutral-600 max-w-md">
              Le module VST ou la ressource demandée n&apos;est assigné à aucun
              bus actif sur <strong>Open Hub (by Anarchy)</strong>.
            </p>
          </div>
          <Link href="/">
            <Button id="btn-404-home" variant="primary" size="md">
              {"← RETOURNER AU RACK PRINCIPAL"}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

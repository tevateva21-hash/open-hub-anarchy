"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import type { AvatarExpression } from "@/lib/openhub-data";
import { SITE_TEXTS } from "@/lib/site-texts";

const AVATAR_CHOICES: { id: AvatarExpression; label: string }[] = [
  { id: "spectateur-a", label: "Crimson" },
  { id: "spectateur-b", label: "Cyber" },
  { id: "synth", label: "Acid Wave" },
  { id: "dsp", label: "Neon DSP" },
  { id: "mod", label: "Matrix" },
  { id: "glitch", label: "Glitch" },
];

export const AuthModal: React.FC = () => {
  const { authModalOpen, closeAuthModal, login } = useAuth();
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [expression, setExpression] =
    useState<AvatarExpression>("spectateur-a");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError("Image trop lourde (1.5 Mo max).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, pseudo, expression, avatarUrl || undefined);
    if (!res.ok) {
      setError(res.error ?? "Connexion impossible.");
    } else {
      setError(null);
      setEmail("");
      setPseudo("");
      setAvatarUrl("");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-brand-white border-2 border-black rounded-xl shadow-comic overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-brand-pearl border-b-2 border-black font-mono text-xs font-bold">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-red" />
            <span id="auth-modal-title">{SITE_TEXTS.auth.modalTitle}</span>
          </span>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Fermer la fenêtre de connexion"
            className="px-2 py-0.5 rounded border border-black bg-brand-white hover:bg-brand-red hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="font-sans text-xs text-neutral-600 leading-relaxed">
            {SITE_TEXTS.auth.modalDescription}
          </p>

          <div>
            <label
              htmlFor="auth-email"
              className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
            >
              Adresse e-mail
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artiste@exemple.org"
              className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="auth-pseudo"
              className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
            >
              Pseudo affiché
            </label>
            <input
              id="auth-pseudo"
              type="text"
              required
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Ex: Acid_Koma"
              className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="block font-mono text-[11px] font-bold uppercase text-neutral-600">
                Avatar Anarchy (style ou image perso)
              </span>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="font-mono text-[10px] text-brand-red underline"
                >
                  Retirer l&apos;image
                </button>
              )}
            </div>

            <div className="mb-2.5 flex items-center gap-3 p-2 rounded-lg border border-dashed border-neutral-400 bg-brand-pearl/60">
              <AvatarBD
                name={pseudo || "Anarchy"}
                expression={expression}
                src={avatarUrl || undefined}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <label className="inline-block cursor-pointer px-2.5 py-1 rounded border border-black bg-brand-white hover:bg-brand-pearl font-mono text-[10px] font-bold">
                  📷 IMPORTER UNE IMAGE
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                </label>
                <p className="font-mono text-[10px] text-neutral-500 mt-1 truncate">
                  PNG/JPG/WebP ou choisis un style ci-dessous
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {AVATAR_CHOICES.map((c) => {
                const active = !avatarUrl && expression === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrl("");
                      setExpression(c.id);
                    }}
                    className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 font-mono text-[10px] font-bold transition-all ${
                      active
                        ? "bg-brand-pearl border-black shadow-comic-sm"
                        : "bg-brand-white border-neutral-200 hover:border-black"
                    }`}
                  >
                    <AvatarBD
                      name={pseudo || c.label}
                      expression={c.id}
                      size="sm"
                    />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p role="alert" className="font-mono text-xs font-bold text-brand-red">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="clinical"
              size="sm"
              onClick={closeAuthModal}
            >
              ANNULER
            </Button>
            <Button type="submit" variant="primary" size="md">
              SE CONNECTER
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

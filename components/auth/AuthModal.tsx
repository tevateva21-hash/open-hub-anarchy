"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import type { AvatarExpression } from "@/lib/openhub-data";

const AVATAR_CHOICES: { id: AvatarExpression; label: string }[] = [
  { id: "spectateur-a", label: "3D Classic" },
  { id: "spectateur-b", label: "3D Cool" },
  { id: "synth", label: "Synth" },
  { id: "dsp", label: "DSP" },
  { id: "hyped", label: "Hyped" },
  { id: "glitch", label: "Glitch" },
];

export const AuthModal: React.FC = () => {
  const { authModalOpen, closeAuthModal, login } = useAuth();
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [expression, setExpression] =
    useState<AvatarExpression>("spectateur-a");
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, pseudo, expression);
    if (!res.ok) {
      setError(res.error ?? "Connexion impossible.");
    } else {
      setError(null);
      setEmail("");
      setPseudo("");
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
            <span id="auth-modal-title">CONNEXION // OPEN HUB COMMUNAUTÉ</span>
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
            Connectez-vous simplement avec un e-mail et un pseudo pour publier
            des sons sur la Radio, partager des samples, poster sur le Forum ou
            rédiger des articles.
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
            <span className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1.5">
              Avatar BD 3D
            </span>
            <div className="grid grid-cols-3 gap-2">
              {AVATAR_CHOICES.map((c) => {
                const active = expression === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setExpression(c.id)}
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

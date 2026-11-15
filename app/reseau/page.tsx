"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAuth } from "@/components/auth/AuthContext";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { uploadToOpenHubStorage } from "@/lib/supabase-storage";
import { SITE_TEXTS } from "@/lib/site-texts";
import type { AvatarExpression } from "@/lib/openhub-data";

interface SocialProfile {
  email: string;
  pseudo: string;
  bio: string;
  avatar_style: AvatarExpression;
  avatar_url?: string;
  github_url?: string;
  soundcloud_url?: string;
}

interface SocialPost {
  id: string;
  author_email: string;
  author_pseudo: string;
  author_avatar_style: AvatarExpression;
  author_avatar_url?: string;
  category: "STATUT" | "COLLAB" | "SON" | "VST";
  content: string;
  likes_count: number;
  created_at: string;
}

const POSTS_KEY = "openhub_social_posts_v1";
const FOLLOWS_KEY = "openhub_social_follows_v1";
const PROFILES_KEY = "openhub_social_profiles_v1";

const AVATAR_STYLES: { id: AvatarExpression; label: string }[] = [
  { id: "spectateur-a", label: "Crimson" },
  { id: "spectateur-b", label: "Cyber" },
  { id: "synth", label: "Acid Wave" },
  { id: "dsp", label: "Neon DSP" },
  { id: "mod", label: "Matrix" },
  { id: "glitch", label: "Glitch" },
];

export default function ReseauSocialPage() {
  const { user, openAuthModal, updateProfile } = useAuth();
  const supabaseReady = isSupabaseConfigured();

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const [postCategory, setPostCategory] =
    useState<SocialPost["category"]>("STATUT");
  const [postContent, setPostContent] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Édition rapide de profil
  const [bioInput, setBioInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [soundcloudInput, setSoundcloudInput] = useState("");

  useEffect(() => {
    if (user) {
      setBioInput(user.bio ?? "");
      setGithubInput(user.githubUrl ?? "");
      setSoundcloudInput(user.soundcloudUrl ?? "");
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const [{ data: dbPosts }, { data: dbProfiles }] = await Promise.all([
            supabase
              .from("social_posts")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(60),
            supabase
              .from("profiles")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(60),
          ]);
          if (dbPosts) setPosts(dbPosts as SocialPost[]);
          if (dbProfiles) setProfiles(dbProfiles as SocialProfile[]);
          if (user) {
            const { data: dbFollows } = await supabase
              .from("social_follows")
              .select("following_pseudo")
              .eq("follower_email", user.email);
            if (dbFollows) {
              setFollowing(
                dbFollows.map((f: { following_pseudo: string }) => f.following_pseudo)
              );
            }
          }
          return;
        } catch {
          // fallback localStorage si la table n'existe pas encore
        }
      }

      try {
        const rawPosts = window.localStorage.getItem(POSTS_KEY);
        if (rawPosts) setPosts(JSON.parse(rawPosts) as SocialPost[]);
        const rawProfiles = window.localStorage.getItem(PROFILES_KEY);
        if (rawProfiles) setProfiles(JSON.parse(rawProfiles) as SocialProfile[]);
        const rawFollows = window.localStorage.getItem(FOLLOWS_KEY);
        if (rawFollows) setFollowing(JSON.parse(rawFollows) as string[]);
      } catch {
        // ignore
      }
    };

    void loadData();
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    updateProfile({
      bio: bioInput.trim(),
      githubUrl: githubInput.trim() || undefined,
      soundcloudUrl: soundcloudInput.trim() || undefined,
    });
    const nextProfile: SocialProfile = {
      email: user.email,
      pseudo: user.pseudo,
      bio: bioInput.trim(),
      avatar_style: user.expression,
      avatar_url: user.avatarUrl,
      github_url: githubInput.trim() || undefined,
      soundcloud_url: soundcloudInput.trim() || undefined,
    };
    const nextProfiles = [
      nextProfile,
      ...profiles.filter((p) => p.email !== user.email),
    ];
    setProfiles(nextProfiles);
    try {
      window.localStorage.setItem(PROFILES_KEY, JSON.stringify(nextProfiles));
    } catch {
      // ignore
    }
    setStatusMessage("Profil mis à jour.");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setStatusMessage("Image trop lourde (1.5 Mo max).");
      return;
    }

    const cloudUrl = await uploadToOpenHubStorage(file, "avatars");
    if (cloudUrl) {
      updateProfile({ avatarUrl: cloudUrl });
      setStatusMessage("Nouvel avatar enregistré sur Supabase Storage.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateProfile({ avatarUrl: reader.result });
        setStatusMessage("Nouvel avatar enregistré localement.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleFollow = async (targetPseudo: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const already = following.includes(targetPseudo);
    const next = already
      ? following.filter((p) => p !== targetPseudo)
      : [...following, targetPseudo];
    setFollowing(next);
    try {
      window.localStorage.setItem(FOLLOWS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        if (already) {
          await supabase
            .from("social_follows")
            .delete()
            .eq("follower_email", user.email)
            .eq("following_pseudo", targetPseudo);
        } else {
          await supabase.from("social_follows").insert({
            follower_email: user.email,
            following_pseudo: targetPseudo,
          });
        }
      } catch {
        // ignore
      }
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    const clean = postContent.trim();
    if (!clean) return;

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      author_email: user.email,
      author_pseudo: user.pseudo,
      author_avatar_style: user.expression,
      author_avatar_url: user.avatarUrl,
      category: postCategory,
      content: clean,
      likes_count: 0,
      created_at: new Date().toISOString(),
    };

    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    setPostContent("");
    try {
      window.localStorage.setItem(POSTS_KEY, JSON.stringify(nextPosts));
    } catch {
      // ignore
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("social_posts").insert({
          author_email: newPost.author_email,
          author_pseudo: newPost.author_pseudo,
          author_avatar_style: newPost.author_avatar_style,
          author_avatar_url: newPost.author_avatar_url ?? "",
          category: newPost.category,
          content: newPost.content,
          likes_count: 0,
        });
      } catch {
        // ignore
      }
    }
  };

  const handleLikePost = async (post: SocialPost) => {
    const nextLikes = post.likes_count + 1;
    const nextPosts = posts.map((p) =>
      p.id === post.id ? { ...p, likes_count: nextLikes } : p
    );
    setPosts(nextPosts);
    try {
      window.localStorage.setItem(POSTS_KEY, JSON.stringify(nextPosts));
    } catch {
      // ignore
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("social_posts")
          .update({ likes_count: nextLikes })
          .eq("id", post.id);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black pb-5">
        <div>
          <span className="inline-block px-2 py-0.5 rounded bg-brand-black text-brand-white font-mono text-[10px] font-bold uppercase mb-2">
            {SITE_TEXTS.social.pageBadge}
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-black">
            {SITE_TEXTS.social.pageTitle}
          </h1>
          <p className="font-sans text-sm text-neutral-600 mt-1 max-w-2xl">
            {SITE_TEXTS.social.pageDescription}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded border-2 border-black font-mono text-[10px] font-bold ${
              supabaseReady
                ? "bg-emerald-100 text-emerald-900"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {supabaseReady
              ? "🟢 SUPABASE CONNECTÉ"
              : "🟡 MODE LOCAL (EN ATTENTE ENV SUPABASE)"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNE GAUCHE : Mon Profil, Avatar & Abonnements */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold uppercase">
                MON PROFIL &amp; AVATAR
              </h2>
              {user && (
                <span className="font-mono text-[11px] font-bold text-brand-red">
                  @{user.pseudo}
                </span>
              )}
            </div>

            {!user ? (
              <div className="space-y-3">
                <p className="font-sans text-xs text-neutral-600">
                  Connecte-toi pour personnaliser ton avatar, écrire ta bio et
                  suivre d&apos;autres producteurs.
                </p>
                <Button variant="primary" size="sm" onClick={openAuthModal}>
                  SE CONNECTER
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="flex items-center gap-3">
                  <AvatarBD
                    name={user.pseudo}
                    expression={user.expression}
                    src={user.avatarUrl}
                    size="lg"
                    anaglyphRing
                  />
                  <div className="space-y-1.5">
                    <label className="inline-block cursor-pointer px-2.5 py-1 rounded border-2 border-black bg-brand-pearl hover:bg-brand-white font-mono text-[10px] font-bold">
                      📷 CHANGER AVATAR
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {user.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => updateProfile({ avatarUrl: undefined })}
                        className="block font-mono text-[10px] text-brand-red underline"
                      >
                        Revenir au style SVG
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {AVATAR_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        updateProfile({ expression: st.id, avatarUrl: undefined })
                      }
                      className={`px-2 py-1 rounded border font-mono text-[10px] font-bold ${
                        !user.avatarUrl && user.expression === st.id
                          ? "border-black bg-brand-black text-white"
                          : "border-neutral-300 bg-brand-white hover:border-black"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-neutral-600 mb-1">
                    Bio / Matériel / Style
                  </label>
                  <textarea
                    rows={2}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Ex: Psytrance 142 BPM · Serum, Vital & PsyLab..."
                    className="w-full px-2.5 py-1.5 rounded border-2 border-black font-sans text-xs"
                  />
                </div>

                <input
                  type="url"
                  value={soundcloudInput}
                  onChange={(e) => setSoundcloudInput(e.target.value)}
                  placeholder="Lien SoundCloud (https://soundcloud.com/...)"
                  className="w-full px-2.5 py-1.5 rounded border border-black font-mono text-[11px]"
                />
                <input
                  type="url"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="Lien GitHub (https://github.com/...)"
                  className="w-full px-2.5 py-1.5 rounded border border-black font-mono text-[11px]"
                />

                {statusMessage && (
                  <p className="font-mono text-[11px] font-bold text-emerald-700">
                    {statusMessage}
                  </p>
                )}

                <Button type="submit" variant="primary" size="sm" className="w-full">
                  ENREGISTRER MON PROFIL
                </Button>
              </form>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <h2 className="font-mono text-sm font-bold uppercase">
              MEMBRES &amp; ABONNEMENTS ({profiles.length})
            </h2>
            {profiles.length === 0 ? (
              <p className="font-sans text-xs text-neutral-500">
                Aucun profil public enregistré pour l&apos;instant. Enregistre le
                tien ci-dessus pour apparaître dans l&apos;annuaire.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {profiles.map((prof) => {
                  const isFollowed = following.includes(prof.pseudo);
                  const isMe = user?.email === prof.email;
                  return (
                    <div
                      key={prof.email}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-neutral-200 bg-brand-pearl/40"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AvatarBD
                          name={prof.pseudo}
                          expression={prof.avatar_style}
                          src={prof.avatar_url || undefined}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold truncate">
                            @{prof.pseudo}
                          </p>
                          <p className="font-sans text-[11px] text-neutral-500 truncate">
                            {prof.bio || "Producteur Open Hub"}
                          </p>
                        </div>
                      </div>
                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => void handleToggleFollow(prof.pseudo)}
                          className={`px-2 py-1 rounded border border-black font-mono text-[10px] font-bold shrink-0 ${
                            isFollowed
                              ? "bg-brand-black text-white"
                              : "bg-brand-white hover:bg-brand-pearl"
                          }`}
                        >
                          {isFollowed ? "SUIVI ✓" : "+ SUIVRE"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* COLONNE DROITE : Mur Social & Collaborations */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="p-5">
            <form onSubmit={handlePublishPost} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-mono text-sm font-bold uppercase">
                  MUR SOCIAL &amp; COLLABORATIONS
                </h2>
                <div className="flex gap-1.5">
                  {(["STATUT", "COLLAB", "SON", "VST"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPostCategory(cat)}
                      className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${
                        postCategory === cat
                          ? "border-black bg-brand-red text-white"
                          : "border-neutral-300 bg-brand-white hover:border-black"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={SITE_TEXTS.social.wallPlaceholder}
                className="w-full p-3 rounded-lg border-2 border-black bg-brand-white font-sans text-sm"
              />

              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  {SITE_TEXTS.social.wallSubmitLabel}
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-3">
            {posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="font-mono text-xs text-neutral-500">
                  Le mur social est prêt. Publie le premier message pour lancer
                  les échanges !
                </p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <AvatarBD
                        name={post.author_pseudo}
                        expression={post.author_avatar_style}
                        src={post.author_avatar_url || undefined}
                        size="sm"
                      />
                      <div>
                        <span className="font-mono text-xs font-bold">
                          @{post.author_pseudo}
                        </span>
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-brand-pearl border border-black font-mono text-[9px] font-bold">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {new Date(post.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <p className="font-sans text-sm text-brand-black whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => void handleLikePost(post)}
                      className="px-2.5 py-1 rounded border border-black bg-brand-pearl hover:bg-brand-white font-mono text-[11px] font-bold"
                    >
                      ❤️ {post.likes_count}
                    </button>
                    {user && user.pseudo !== post.author_pseudo && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleToggleFollow(post.author_pseudo)
                        }
                        className="font-mono text-[10px] underline text-neutral-600 hover:text-brand-black"
                      >
                        {following.includes(post.author_pseudo)
                          ? "Abonné ✓"
                          : `Suivre @${post.author_pseudo}`}
                      </button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

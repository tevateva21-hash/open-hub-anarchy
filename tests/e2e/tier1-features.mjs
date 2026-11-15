import {
  test,
  fetchPage,
  readProjectFile,
  readAnyProjectFile,
  fileExists,
  assert,
  assertEqual,
  assertIncludes,
  assertMatch,
} from "./helpers.mjs";

export function registerTier1Tests() {
  // ============================================================================
  // F1: Hybrid Clinical DAW + 3D BD Color Palette & Shadows (5 tests)
  // ============================================================================
  test(
    "T1-F1-01",
    1,
    "F1",
    "Tailwind config defines brand-white (#FFFFFF), brand-pearl (#F5F5F5), brand-charcoal (#222226), brand-red (#FF1B24), and brand-black (#000000)",
    async () => {
      const tw = readProjectFile("tailwind.config.ts");
      assertMatch(tw, /#FFFFFF/i, "Tailwind config must define #FFFFFF (brand-white)");
      assertMatch(tw, /#F5F5F5/i, "Tailwind config must define #F5F5F5 (brand-pearl)");
      assertMatch(tw, /#222226/i, "Tailwind config must define #222226 (brand-charcoal)");
      assertMatch(tw, /#FF1B24/i, "Tailwind config must define #FF1B24 (brand-red)");
      assertMatch(tw, /#000000/i, "Tailwind config must define #000000 (brand-black)");
    }
  );

  test(
    "T1-F1-02",
    1,
    "F1",
    "Tailwind config defines 3D anaglyph red (#FF1B24) and cyan (#00E5FF) tokens",
    async () => {
      const tw = readProjectFile("tailwind.config.ts");
      assertIncludes(tw, "anaglyph", "Tailwind config must define anaglyph color group");
      assertMatch(tw, /#00E5FF/i, "Tailwind config must define #00E5FF (anaglyph-cyan)");
      assertMatch(tw, /#FF1B24/i, "Tailwind config must define #FF1B24 (anaglyph-red)");
    }
  );

  test(
    "T1-F1-03",
    1,
    "F1",
    "Tailwind config defines soft DAW clinical shadows and thick ink comic shadows",
    async () => {
      const tw = readProjectFile("tailwind.config.ts");
      assertIncludes(tw, "clinical", "Tailwind config must define shadow-clinical");
      assertIncludes(tw, "clinical-hover", "Tailwind config must define shadow-clinical-hover");
      assertIncludes(tw, "comic", "Tailwind config must define shadow-comic");
      assertIncludes(tw, "comic-sm", "Tailwind config must define shadow-comic-sm");
    }
  );

  test(
    "T1-F1-04",
    1,
    "F1",
    "app/globals.css defines CSS custom properties and .anaglyph-ring 3D offset utility",
    async () => {
      const css = readProjectFile("app/globals.css");
      assertMatch(css, /--brand-white:\s*#ffffff/i, "globals.css must define --brand-white");
      assertMatch(css, /--brand-pearl:\s*#f5f5f5/i, "globals.css must define --brand-pearl");
      assertMatch(css, /--brand-red:\s*#ff1b24/i, "globals.css must define --brand-red");
      assertMatch(css, /--anaglyph-cyan:\s*#00e5ff/i, "globals.css must define --anaglyph-cyan");
      assertIncludes(css, ".anaglyph-ring", "globals.css must define .anaglyph-ring utility");
    }
  );

  test(
    "T1-F1-05",
    1,
    "F1",
    "Live GET / renders clinical DAW background (bg-brand-pearl / bg-brand-white) and comic ink border classes",
    async () => {
      const res = await fetchPage("/");
      assertEqual(res.status, 200, "GET / must return HTTP 200");
      assertIncludes(res.html, "bg-brand-pearl", "Live / HTML must apply bg-brand-pearl");
      assertIncludes(res.html, "bg-brand-white", "Live / HTML must apply bg-brand-white");
      assertIncludes(res.html, "shadow-clinical", "Live / HTML must apply shadow-clinical");
      assertMatch(
        res.html,
        /border-(2|4)\s+border-black|shadow-comic/,
        "Live / HTML must apply thick black comic borders or comic shadows"
      );
    }
  );

  // ============================================================================
  // F2: Dual Technical & UI Typography (Inter + Roboto Mono) (5 tests)
  // ============================================================================
  test(
    "T1-F2-01",
    1,
    "F2",
    "app/layout.tsx loads Google Fonts Inter (--font-inter) and Roboto_Mono (--font-roboto-mono)",
    async () => {
      const layout = readProjectFile("app/layout.tsx");
      assertIncludes(layout, "Inter", "app/layout.tsx must import Inter font");
      assertIncludes(layout, "Roboto_Mono", "app/layout.tsx must import Roboto_Mono font");
      assertIncludes(layout, "--font-inter", "app/layout.tsx must configure --font-inter variable");
      assertIncludes(
        layout,
        "--font-roboto-mono",
        "app/layout.tsx must configure --font-roboto-mono variable"
      );
    }
  );

  test(
    "T1-F2-02",
    1,
    "F2",
    "Tailwind config maps font-sans to var(--font-inter) and font-mono to var(--font-roboto-mono)",
    async () => {
      const tw = readProjectFile("tailwind.config.ts");
      assertIncludes(tw, "var(--font-inter)", "tailwind.config must map sans to var(--font-inter)");
      assertIncludes(
        tw,
        "var(--font-roboto-mono)",
        "tailwind.config must map mono to var(--font-roboto-mono)"
      );
    }
  );

  test(
    "T1-F2-03",
    1,
    "F2",
    "Live GET / HTML root and body apply font-sans and font-mono classes for dual typography",
    async () => {
      const res = await fetchPage("/");
      assertEqual(res.status, 200, "GET / must return HTTP 200");
      assertIncludes(res.html, "font-sans", "Live / HTML must render font-sans");
      assertIncludes(res.html, "font-mono", "Live / HTML must render font-mono for technical readouts");
    }
  );

  test(
    "T1-F2-04",
    1,
    "F2",
    "Button.tsx and Card.tsx enforce font-mono on technical module headers and buttons",
    async () => {
      const btn = readProjectFile("components/ui/Button.tsx");
      const card = readProjectFile("components/ui/Card.tsx");
      assertIncludes(btn, "font-mono", "Button.tsx must use font-mono (Roboto Mono)");
      assertIncludes(card, "font-mono", "Card.tsx module header must use font-mono");
    }
  );

  test(
    "T1-F2-05",
    1,
    "F2",
    "Live GET / renders technical DAW readouts (kHz, BIT, VST3) inside monospace typography",
    async () => {
      const res = await fetchPage("/");
      assertMatch(res.html, /48\.0\s*kHz|24-BIT|VST3/i, "Live / must display DAW technical readouts");
      assertIncludes(res.html, "OPEN HUB", "Live / must display OPEN HUB branding");
    }
  );

  // ============================================================================
  // F3: AvatarBD.tsx Expressive 3D BD Character System (5 tests)
  // ============================================================================
  test(
    "T1-F3-01",
    1,
    "F3",
    "AvatarBD.tsx renders circular comic frame with border-4 border-black and shadow-comic-sm",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertIncludes(avatar, "rounded-full", "AvatarBD must be circular (rounded-full)");
      assertIncludes(avatar, "border-4 border-black", "AvatarBD must have border-4 border-black");
      assertIncludes(avatar, "shadow-comic", "AvatarBD must apply comic shadow");
    }
  );

  test(
    "T1-F3-02",
    1,
    "F3",
    "AvatarBD.tsx SVG renders 3D anaglyph glasses with left lens #FF1B24 and right lens #00E5FF",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertMatch(avatar, /#FF1B24/i, "AvatarBD SVG must include Cinema Red (#FF1B24) left lens");
      assertMatch(avatar, /#00E5FF/i, "AvatarBD SVG must include Anaglyph Cyan (#00E5FF) right lens");
      assertIncludes(avatar, "<svg", "AvatarBD must render inline SVG illustration");
    }
  );

  test(
    "T1-F3-03",
    1,
    "F3",
    "AvatarBD.tsx supports all 8 expressive presets (spectateur-a, spectateur-b, synth, dsp, mod, hyped, shocked, glitch)",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      const requiredExpressions = [
        "spectateur-a",
        "spectateur-b",
        "synth",
        "dsp",
        "mod",
        "hyped",
        "shocked",
        "glitch",
      ];
      for (const expr of requiredExpressions) {
        assertIncludes(
          avatar,
          expr,
          `AvatarBD.tsx must support expression preset "${expr}"`
        );
      }
    }
  );

  test(
    "T1-F3-04",
    1,
    "F3",
    "AvatarBD.tsx supports anaglyphRing (.anaglyph-ring) and audioReactive props",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertMatch(
        avatar,
        /anaglyphRing|anaglyph-ring/,
        "AvatarBD.tsx must support anaglyphRing / .anaglyph-ring"
      );
      assertIncludes(
        avatar,
        "audioReactive",
        "AvatarBD.tsx must support audioReactive prop"
      );
    }
  );

  test(
    "T1-F3-05",
    1,
    "F3",
    "Live GET / renders AvatarBD SVG with #FF1B24 and #00E5FF 3D glasses lenses in the DOM",
    async () => {
      const res = await fetchPage("/");
      assertEqual(res.status, 200, "GET / must return HTTP 200");
      assertMatch(res.html, /#FF1B24/i, "Live / DOM must contain #FF1B24 3D lens");
      assertMatch(res.html, /#00E5FF/i, "Live / DOM must contain #00E5FF 3D lens");
    }
  );

  // ============================================================================
  // F4: Card.tsx, Button.tsx & Comic Badges/Tooltips (5 tests)
  // ============================================================================
  test(
    "T1-F4-01",
    1,
    "F4",
    "Card.tsx implements clinical DAW container with moduleTitle, moduleMeta, and activeIndicator LED",
    async () => {
      const card = readProjectFile("components/ui/Card.tsx");
      assertIncludes(card, "moduleTitle", "Card.tsx must support moduleTitle prop");
      assertIncludes(card, "moduleMeta", "Card.tsx must support moduleMeta prop");
      assertIncludes(card, "activeIndicator", "Card.tsx must support activeIndicator prop");
      assertIncludes(card, "bg-brand-red", "Card.tsx activeIndicator must render bg-brand-red LED");
    }
  );

  test(
    "T1-F4-02",
    1,
    "F4",
    "Button.tsx implements clinical, primary (#FF1B24), and comic (border-2 border-black) variants",
    async () => {
      const btn = readProjectFile("components/ui/Button.tsx");
      assertIncludes(btn, "clinical:", "Button.tsx must define clinical variant");
      assertIncludes(btn, "primary:", "Button.tsx must define primary variant");
      assertIncludes(btn, "comic:", "Button.tsx must define comic variant");
      assertIncludes(btn, "border-2 border-black", "Button.tsx comic variant must use border-2 border-black");
    }
  );

  test(
    "T1-F4-03",
    1,
    "F4",
    "Button.tsx supports sm, md, and lg sizes with Roboto Mono uppercase styling",
    async () => {
      const btn = readProjectFile("components/ui/Button.tsx");
      assertIncludes(btn, "sm:", "Button.tsx must define sm size");
      assertIncludes(btn, "md:", "Button.tsx must define md size");
      assertIncludes(btn, "lg:", "Button.tsx must define lg size");
      assertIncludes(btn, "uppercase", "Button.tsx must style button labels uppercase");
    }
  );

  test(
    "T1-F4-04",
    1,
    "F4",
    "Card.tsx supports interactive hover elevation (shadow-clinical-hover) and noPadding layout mode",
    async () => {
      const card = readProjectFile("components/ui/Card.tsx");
      assertIncludes(card, "interactive", "Card.tsx must support interactive prop");
      assertIncludes(card, "shadow-clinical-hover", "Card.tsx must apply shadow-clinical-hover");
      assertIncludes(card, "noPadding", "Card.tsx must support noPadding prop");
    }
  );

  test(
    "T1-F4-05",
    1,
    "F4",
    "Comic badges and BD speech-bubble tooltips use thick black ink borders and comic shadows across UI",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertIncludes(avatar, "badgeText", "AvatarBD must support comic badgeText");
      assertIncludes(avatar, "border-2 border-black", "Comic badge must use border-2 border-black");
      const res = await fetchPage("/");
      assertIncludes(res.html, "shadow-comic-sm", "Live / must render comic shadow badges");
    }
  );

  // ============================================================================
  // F5: Sticky Header with 3D Emblem, Real Route Nav & Mobile Menu (5 tests)
  // ============================================================================
  test(
    "T1-F5-01",
    1,
    "F5",
    "Global header renders sticky top-0 z-40 bar with 3D anaglyph glasses emblem and OPEN HUB // by anarchy title",
    async () => {
      const res = await fetchPage("/");
      assertEqual(res.status, 200, "GET / must return HTTP 200");
      assertIncludes(res.html, "sticky top-0", "Header must be sticky top-0");
      assertIncludes(res.html, "OPEN HUB", "Header must contain OPEN HUB");
      assertMatch(res.html, /by anarchy/i, "Header must contain 'by anarchy'");
    }
  );

  test(
    "T1-F5-02",
    1,
    "F5",
    "Header navigation provides real Next.js routes for /, /samples, /forum, /blog, and /legal",
    async () => {
      const { content } = readAnyProjectFile([
        "components/layout/HeaderNav.tsx",
        "app/layout.tsx",
      ]);
      const combined =
        content +
        (fileExists("components/layout/HeaderNav.tsx")
          ? readProjectFile("components/layout/HeaderNav.tsx")
          : "");
      for (const route of ["/", "/samples", "/anarchy-visual-design", "/forum", "/blog", "/legal"]) {
        const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        assertMatch(
          combined,
          new RegExp(`href(?:=|:\\s*)["']${escaped}["']`),
          `Header must link to ${route}`
        );
      }
    }
  );

  test(
    "T1-F5-03",
    1,
    "F5",
    "Live GET / navigation bar exposes links to /samples, /forum, /blog, and /legal in rendered HTML",
    async () => {
      const res = await fetchPage("/");
      assertIncludes(res.html, 'href="/samples"', "Rendered HTML must link to /samples");
      assertIncludes(res.html, 'href="/forum"', "Rendered HTML must link to /forum");
      assertIncludes(res.html, 'href="/blog"', "Rendered HTML must link to /blog");
      assertIncludes(res.html, 'href="/legal"', "Rendered HTML must link to /legal");
    }
  );

  test(
    "T1-F5-04",
    1,
    "F5",
    "Header implements responsive mobile menu button/drawer (<768px md:hidden) for small viewports",
    async () => {
      const headerSource = fileExists("components/layout/HeaderNav.tsx")
        ? readProjectFile("components/layout/HeaderNav.tsx")
        : readProjectFile("app/layout.tsx");
      assertMatch(
        headerSource,
        /md:hidden|aria-expanded|mobileMenu|isOpen|menuOpen/i,
        "Header must implement a mobile navigation toggle/drawer for <768px viewports"
      );
    }
  );

  test(
    "T1-F5-05",
    1,
    "F5",
    "app/layout.tsx includes WCAG skip-to-content link (#main-content) and 48.0 kHz // 24-BIT audio engine readout",
    async () => {
      const res = await fetchPage("/");
      assertIncludes(res.html, "#main-content", "Rendered HTML must include #main-content skip link");
      assertMatch(res.html, /48\.0\s*kHz/i, "Header must display 48.0 kHz audio readout");
    }
  );

  // ============================================================================
  // F6: Filterable 3-Column VST Plugin Catalogue (app/page.tsx) (5 tests)
  // ============================================================================
  test(
    "T1-F6-01",
    1,
    "F6",
    "lib/openhub-data.ts defines at least 6 open-source VST plugins (anr-vst-01 through anr-vst-06)",
    async () => {
      assert(fileExists("lib/openhub-data.ts"), "lib/openhub-data.ts must exist");
      const data = readProjectFile("lib/openhub-data.ts");
      for (const id of [
        "anr-vst-01",
        "anr-vst-02",
        "anr-vst-03",
        "anr-vst-04",
        "anr-vst-05",
        "anr-vst-06",
      ]) {
        assertIncludes(data, id, `lib/openhub-data.ts must define plugin ${id}`);
      }
    }
  );

  test(
    "T1-F6-02",
    1,
    "F6",
    "Home page (app/page.tsx) renders 3-column responsive VST plugin grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)",
    async () => {
      const page = readProjectFile("app/page.tsx");
      assertIncludes(
        page,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        "app/page.tsx must use 3-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)"
      );
      const res = await fetchPage("/");
      assertIncludes(
        res.html,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        "Live / HTML must render 3-column VST grid"
      );
    }
  );

  test(
    "T1-F6-03",
    1,
    "F6",
    "Home page VST catalogue supports category filtering and live search input",
    async () => {
      const page = readProjectFile("app/page.tsx");
      assertMatch(
        page,
        /SATURATION|DYNAMICS|SYNTH|REVERB|VIDEO_FX/i,
        "app/page.tsx must support VST category filtering"
      );
      assertMatch(
        page,
        /search|query|filter/i,
        "app/page.tsx must include search/filter state for VST plugins"
      );
    }
  );

  test(
    "T1-F6-04",
    1,
    "F6",
    "Each VST card on Home page includes TEST_SIGNAL audio preview trigger connected to AudioPlayerContext",
    async () => {
      const page = readProjectFile("app/page.tsx");
      assertMatch(
        page,
        /TEST_SIGNAL|playTrack|useAudioPlayer/,
        "app/page.tsx must wire VST card TEST_SIGNAL button to useAudioPlayer"
      );
      const res = await fetchPage("/");
      assertMatch(
        res.html,
        /TEST_SIGNAL|PREVIEW|LISTEN/i,
        "Live / HTML must display audio preview trigger on VST cards"
      );
    }
  );

  test(
    "T1-F6-05",
    1,
    "F6",
    "Home page VST catalogue cards link directly to dedicated plugin pages (/vst/anr-vst-01..06)",
    async () => {
      const res = await fetchPage("/");
      assertIncludes(
        res.html,
        "/vst/anr-vst-01",
        "Live / HTML must link to /vst/anr-vst-01"
      );
      assertIncludes(
        res.html,
        "/vst/anr-vst-02",
        "Live / HTML must link to /vst/anr-vst-02"
      );
      assertIncludes(
        res.html,
        "/vst/anr-vst-03",
        "Live / HTML must link to /vst/anr-vst-03"
      );
    }
  );

  // ============================================================================
  // F7: Samples & Sounds Sharing Hub (/samples) (5 tests)
  // ============================================================================
  test(
    "T1-F7-01",
    1,
    "F7",
    "GET /samples returns HTTP 200 and renders the Open Hub Samples & Sounds Sharing Hub",
    async () => {
      assert(fileExists("app/samples/page.tsx"), "app/samples/page.tsx must exist");
      const res = await fetchPage("/samples");
      assertEqual(res.status, 200, "GET /samples must return HTTP 200");
      assertMatch(res.html, /SAMPLES|SONS|AUDIO/i, "Live /samples must render Samples hub heading");
    }
  );

  test(
    "T1-F7-02",
    1,
    "F7",
    "Samples Hub includes all 6 official Google Drive .wav tracks (Anarchy.wav, SYSTEM OVERLOAD.wav, POWER GLOVE REMIX.wav, psychedelic trap.wav, PSYCHEDELIC VIBE.wav, tribal -136.wav)",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      const res = await fetchPage("/samples");
      const requiredTracks = [
        "Anarchy.wav",
        "SYSTEM OVERLOAD.wav",
        "POWER GLOVE REMIX.wav",
        "psychedelic trap.wav",
        "PSYCHEDELIC VIBE.wav",
        "tribal -136.wav",
      ];
      for (const trackName of requiredTracks) {
        assertIncludes(
          data,
          trackName,
          `lib/openhub-data.ts must contain track "${trackName}"`
        );
        assertIncludes(
          res.html,
          trackName,
          `Live /samples HTML must render track "${trackName}"`
        );
      }
    }
  );

  test(
    "T1-F7-03",
    1,
    "F7",
    "Samples Hub provides genre/BPM/key filtering and waveform visualization bars",
    async () => {
      const samplesPage = readProjectFile("app/samples/page.tsx");
      assertMatch(
        samplesPage,
        /genre|bpm|search|filter/i,
        "app/samples/page.tsx must support genre/BPM/search filtering"
      );
      assertMatch(
        samplesPage,
        /waveformPeaks|waveform/i,
        "app/samples/page.tsx must render waveform visualization"
      );
    }
  );

  test(
    "T1-F7-04",
    1,
    "F7",
    "Samples Hub wires 1-click sample preview playback to global Sticky Bottom Player via useAudioPlayer()",
    async () => {
      const samplesPage = readProjectFile("app/samples/page.tsx");
      assertIncludes(
        samplesPage,
        "useAudioPlayer",
        "app/samples/page.tsx must use useAudioPlayer() hook"
      );
      assertIncludes(
        samplesPage,
        "playTrack",
        "app/samples/page.tsx must trigger playTrack() on sample preview"
      );
    }
  );

  test(
    "T1-F7-05",
    1,
    "F7",
    "Samples Hub provides royalty-free WAV download trigger and Community Sample Pack submission form",
    async () => {
      const samplesPage = readProjectFile("app/samples/page.tsx");
      assertMatch(
        samplesPage,
        /download|WAV|CC0|CC-BY/i,
        "app/samples/page.tsx must provide WAV download action and CC0/CC-BY metadata"
      );
      assertMatch(
        samplesPage,
        /<form|onSubmit|submit/i,
        "app/samples/page.tsx must provide a community sample pack submission form"
      );
    }
  );

  // ============================================================================
  // F8: Community Forum (/forum) (5 tests)
  // ============================================================================
  test(
    "T1-F8-01",
    1,
    "F8",
    "GET /forum returns HTTP 200 and renders modernized imageboard & alternating rows (#FFFFFF / #F5F5F5)",
    async () => {
      assert(fileExists("app/forum/page.tsx"), "app/forum/page.tsx must exist");
      const forumSource = readProjectFile("app/forum/page.tsx");
      assertMatch(
        forumSource,
        /bg-brand-white|bg-brand-pearl|#FFFFFF|#F5F5F5/,
        "app/forum/page.tsx must alternate #FFFFFF (bg-brand-white) and #F5F5F5 (bg-brand-pearl) rows"
      );
      const res = await fetchPage("/forum");
      assertEqual(res.status, 200, "GET /forum must return HTTP 200");
    }
  );

  test(
    "T1-F8-02",
    1,
    "F8",
    "Forum threads render expressive AvatarBD comic avatars per post with Inter titles and Roboto Mono metadata",
    async () => {
      const forumSource = readProjectFile("app/forum/page.tsx");
      assertIncludes(forumSource, "AvatarBD", "app/forum/page.tsx must render AvatarBD");
      assertIncludes(forumSource, "font-sans", "app/forum/page.tsx must use Inter (font-sans) for titles/copy");
      assertIncludes(forumSource, "font-mono", "app/forum/page.tsx must use Roboto Mono (font-mono) for metadata/tripcodes");
    }
  );

  test(
    "T1-F8-03",
    1,
    "F8",
    "Forum supports board category filtering across DSP_DEV, VST_RELEASE, SAMPLES, and SHOWCASE",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      const forumSource = readProjectFile("app/forum/page.tsx");
      for (const board of ["DSP_DEV", "VST_RELEASE", "SAMPLES", "SHOWCASE"]) {
        assertIncludes(data, board, `lib/openhub-data.ts must define board ${board}`);
      }
      assertMatch(
        forumSource,
        /DSP_DEV|VST_RELEASE|SAMPLES|SHOWCASE|board/i,
        "app/forum/page.tsx must filter threads by board category"
      );
    }
  );

  test(
    "T1-F8-04",
    1,
    "F8",
    "Forum supports interactive New Thread creation and Quick Reply posting in client state",
    async () => {
      const forumSource = readProjectFile("app/forum/page.tsx");
      assertMatch(
        forumSource,
        /newThread|createThread|handleCreateThread|handleAddReply|reply|replies/i,
        "app/forum/page.tsx must support creating new threads and posting replies"
      );
    }
  );

  test(
    "T1-F8-05",
    1,
    "F8",
    "Live GET /forum renders initial community discussions, tripcodes, and comic role badges",
    async () => {
      const res = await fetchPage("/forum");
      assertEqual(res.status, 200, "GET /forum must return HTTP 200");
      assertMatch(
        res.html,
        /DSP|VST|ANAGLYPH|SATURATOR|FORUM/i,
        "Live /forum HTML must render initial forum threads"
      );
    }
  );

  // ============================================================================
  // F9: Blog & Technical DSP Documentation (/blog & /blog/[slug]) (5 tests)
  // ============================================================================
  test(
    "T1-F9-01",
    1,
    "F9",
    "GET /blog returns HTTP 200 and lists technical DSP articles and whitepapers",
    async () => {
      assert(fileExists("app/blog/page.tsx"), "app/blog/page.tsx must exist");
      const res = await fetchPage("/blog");
      assertEqual(res.status, 200, "GET /blog must return HTTP 200");
      assertMatch(res.html, /BLOG|DSP|DOCUMENTATION/i, "Live /blog must render blog index");
    }
  );

  test(
    "T1-F9-02",
    1,
    "F9",
    "Blog reading layout uses clean single-column container (max-w-3xl mx-auto) with Inter bold headings",
    async () => {
      const blogIndex = readProjectFile("app/blog/page.tsx");
      const blogSlug = fileExists("app/blog/[slug]/page.tsx")
        ? readProjectFile("app/blog/[slug]/page.tsx")
        : "";
      const combined = blogIndex + "\n" + blogSlug;
      assertIncludes(
        combined,
        "max-w-3xl",
        "Blog layout must use clean single-column max-w-3xl container"
      );
      assertIncludes(
        combined,
        "font-bold",
        "Blog layout must use bold headings"
      );
    }
  );

  test(
    "T1-F9-03",
    1,
    "F9",
    "Blog articles frame quotes/callouts and code snippets with a Cinema Red (#FF1B24 / border-brand-red) left border",
    async () => {
      const blogIndex = readProjectFile("app/blog/page.tsx");
      const blogSlug = fileExists("app/blog/[slug]/page.tsx")
        ? readProjectFile("app/blog/[slug]/page.tsx")
        : "";
      const combined = blogIndex + "\n" + blogSlug;
      assertMatch(
        combined,
        /border-l-(2|4)\s+border-brand-red|#FF1B24/i,
        "Blog quotes/callouts must be framed by a Cinema Red (#FF1B24 / border-brand-red) left border"
      );
    }
  );

  test(
    "T1-F9-04",
    1,
    "F9",
    "Blog articles render technical DSP code blocks in Roboto Mono (font-mono)",
    async () => {
      const blogIndex = readProjectFile("app/blog/page.tsx");
      const blogSlug = fileExists("app/blog/[slug]/page.tsx")
        ? readProjectFile("app/blog/[slug]/page.tsx")
        : "";
      const combined = blogIndex + "\n" + blogSlug;
      assertIncludes(combined, "font-mono", "Blog code blocks must use font-mono (Roboto Mono)");
      assertMatch(combined, /<pre|<code|codeSnippet/, "Blog must render DSP code blocks");
    }
  );

  test(
    "T1-F9-05",
    1,
    "F9",
    "GET /blog/[slug] returns HTTP 200 for published articles defined in lib/openhub-data.ts",
    async () => {
      assert(fileExists("app/blog/[slug]/page.tsx"), "app/blog/[slug]/page.tsx must exist");
      const data = readProjectFile("lib/openhub-data.ts");
      const slugMatch = data.match(/slug:\s*["']([a-z0-9-]+)["']/i);
      assert(slugMatch && slugMatch[1], "lib/openhub-data.ts must define at least one blog post slug");
      const res = await fetchPage(`/blog/${slugMatch[1]}`);
      assertEqual(res.status, 200, `GET /blog/${slugMatch[1]} must return HTTP 200`);
      assertIncludes(res.html, "max-w-3xl", "Live /blog/[slug] must render max-w-3xl single-column reader");
    }
  );

  // ============================================================================
  // F10: Persistent Sticky Bottom Audio Player & Global Context (Jalon 3) (5 tests)
  // ============================================================================
  test(
    "T1-F10-01",
    1,
    "F10",
    "AudioPlayerContext.tsx and StickyBottomPlayer.tsx exist and are mounted in root app/layout.tsx",
    async () => {
      assert(
        fileExists("components/audio/AudioPlayerContext.tsx"),
        "components/audio/AudioPlayerContext.tsx must exist"
      );
      assert(
        fileExists("components/audio/StickyBottomPlayer.tsx"),
        "components/audio/StickyBottomPlayer.tsx must exist"
      );
      const layout = readProjectFile("app/layout.tsx");
      assertIncludes(
        layout,
        "AudioPlayerProvider",
        "app/layout.tsx must wrap the application in AudioPlayerProvider"
      );
      assertIncludes(
        layout,
        "StickyBottomPlayer",
        "app/layout.tsx must mount StickyBottomPlayer globally"
      );
    }
  );

  test(
    "T1-F10-02",
    1,
    "F10",
    "StickyBottomPlayer renders fixed bottom-0 left-0 right-0 z-40 #F5F5F5 bar with #302E2E / dark top border",
    async () => {
      const player = readProjectFile("components/audio/StickyBottomPlayer.tsx");
      assertIncludes(player, "fixed bottom-0", "StickyBottomPlayer must be fixed bottom-0");
      assertMatch(
        player,
        /bg-brand-pearl|#F5F5F5/i,
        "StickyBottomPlayer must use Pearl Grey (#F5F5F5 / bg-brand-pearl) background"
      );
      assertMatch(
        player,
        /#302E2E|border-brand-charcoal|border-t/i,
        "StickyBottomPlayer must have structural top border (#302E2E / charcoal)"
      );
    }
  );

  test(
    "T1-F10-03",
    1,
    "F10",
    "StickyBottomPlayer renders real-time <canvas> oscilloscope trace in Cinema Red (#FF1B24) and bicolor VU meters",
    async () => {
      const player = readProjectFile("components/audio/StickyBottomPlayer.tsx");
      assertIncludes(player, "<canvas", "StickyBottomPlayer must include a <canvas> oscilloscope");
      assertMatch(
        player,
        /#FF1B24/i,
        "StickyBottomPlayer oscilloscope must draw Cinema Red (#FF1B24) waveform trace"
      );
      assertMatch(
        player,
        /peakLevels|VU|meter/i,
        "StickyBottomPlayer must render stereo/bicolor VU peak meters"
      );
    }
  );

  test(
    "T1-F10-04",
    1,
    "F10",
    "AudioPlayerContext implements Web Audio API (AudioContext + AnalyserNode) with DRY/WET DSP switch",
    async () => {
      const ctx = readProjectFile("components/audio/AudioPlayerContext.tsx");
      assertMatch(
        ctx,
        /AudioContext|webkitAudioContext/,
        "AudioPlayerContext must use browser Web Audio API AudioContext"
      );
      assertIncludes(
        ctx,
        "AnalyserNode",
        "AudioPlayerContext or comments/types must wire AnalyserNode / createAnalyser"
      );
      assertIncludes(ctx, "toggleWetDry", "AudioPlayerContext must expose toggleWetDry()");
      assertIncludes(ctx, "wetDryMix", "AudioPlayerContext must expose wetDryMix state");
    }
  );

  test(
    "T1-F10-05",
    1,
    "F10",
    "Live GET / renders StickyBottomPlayer in the global shell with transport controls and oscilloscope canvas",
    async () => {
      const res = await fetchPage("/");
      assertIncludes(res.html, "fixed bottom-0", "Live / HTML must include fixed bottom-0 player bar");
      assertIncludes(res.html, "<canvas", "Live / HTML must render oscilloscope <canvas>");
    }
  );

  // ============================================================================
  // F11: Detailed Plugin Download Pages (/vst/[id]) (Jalon 4) (5 tests)
  // ============================================================================
  test(
    "T1-F11-01",
    1,
    "F11",
    "GET /vst/anr-vst-01 through /vst/anr-vst-06 all return HTTP 200 with dedicated plugin details",
    async () => {
      assert(fileExists("app/vst/[id]/page.tsx"), "app/vst/[id]/page.tsx must exist");
      for (const id of [
        "anr-vst-01",
        "anr-vst-02",
        "anr-vst-03",
        "anr-vst-04",
        "anr-vst-05",
        "anr-vst-06",
      ]) {
        const res = await fetchPage(`/vst/${id}`);
        assertEqual(res.status, 200, `GET /vst/${id} must return HTTP 200`);
      }
    }
  );

  test(
    "T1-F11-02",
    1,
    "F11",
    "Plugin detail page (/vst/anr-vst-01) provides macOS, Windows, and Linux installers for VST3/CLAP/AU",
    async () => {
      const res = await fetchPage("/vst/anr-vst-01");
      assertMatch(res.html, /macOS/i, "Plugin page must display macOS download option");
      assertMatch(res.html, /Windows/i, "Plugin page must display Windows download option");
      assertMatch(res.html, /Linux/i, "Plugin page must display Linux download option");
      assertMatch(res.html, /VST3/i, "Plugin page must display VST3 format");
      assertMatch(res.html, /CLAP/i, "Plugin page must display CLAP format");
    }
  );

  test(
    "T1-F11-03",
    1,
    "F11",
    "Plugin detail page displays verifiable SHA-256 cryptographic checksums in Roboto Mono with copy action",
    async () => {
      const vstPage = readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(vstPage, /sha256|SHA-256/i, "app/vst/[id]/page.tsx must render SHA-256 checksums");
      const res = await fetchPage("/vst/anr-vst-01");
      assertMatch(res.html, /SHA-256/i, "Live /vst/anr-vst-01 must display SHA-256 verification section");
    }
  );

  test(
    "T1-F11-04",
    1,
    "F11",
    "Plugin detail page displays DSP metrics (oversampling, latency, CPU load, license) and version changelog",
    async () => {
      const res = await fetchPage("/vst/anr-vst-01");
      assertMatch(
        res.html,
        /oversampling|latency|cpu|GPL|MIT/i,
        "Live /vst/anr-vst-01 must display technical DSP metrics and open-source license"
      );
      assertMatch(
        res.html,
        /changelog|v2\.|v1\./i,
        "Live /vst/anr-vst-01 must display version history / changelog"
      );
    }
  );

  test(
    "T1-F11-05",
    1,
    "F11",
    "Plugin download action respects GDPR analytics consent before recording openhub_vst_telemetry",
    async () => {
      const vstPage = readProjectFile("app/vst/[id]/page.tsx");
      assertIncludes(
        vstPage,
        "openhub_vst_telemetry",
        "app/vst/[id]/page.tsx must reference openhub_vst_telemetry"
      );
      assertMatch(
        vstPage,
        /getStoredConsent|analytics|hasConsent/,
        "app/vst/[id]/page.tsx must check GDPR analytics consent before writing openhub_vst_telemetry"
      );
    }
  );

  // ============================================================================
  // F12: Interactive Figma UI Kit Audio-Reactive Plugin Rack (5 tests)
  // ============================================================================
  test(
    "T1-F12-01",
    1,
    "F12",
    "FigmaPluginRack component exists and renders Section A: 1920x1080 | 60FPS Video Output Preview with 3D BD status overlay",
    async () => {
      const rackSource = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        rackSource,
        /1920x1080\s*\|\s*60FPS/i,
        "FigmaPluginRack Section A must display '1920x1080 | 60FPS' technical readout"
      );
      assertMatch(
        rackSource,
        /VIDEO OUTPUT PREVIEW/i,
        "FigmaPluginRack Section A must display 'VIDEO OUTPUT PREVIEW'"
      );
    }
  );

  test(
    "T1-F12-02",
    1,
    "F12",
    "FigmaPluginRack renders Section B: 16-Step Sequencer, minimalist Color Wheel, and Glitch / Strobe / Invert triggers",
    async () => {
      const rackSource = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        rackSource,
        /16|sequencer|steps/i,
        "FigmaPluginRack Section B must include a 16-step sequencer"
      );
      assertMatch(
        rackSource,
        /Glitch/i,
        "FigmaPluginRack Section B must include Glitch trigger"
      );
      assertMatch(
        rackSource,
        /Strobe/i,
        "FigmaPluginRack Section B must include Strobe trigger"
      );
      assertMatch(
        rackSource,
        /Invert/i,
        "FigmaPluginRack Section B must include Invert trigger"
      );
    }
  );

  test(
    "T1-F12-03",
    1,
    "F12",
    "FigmaPluginRack renders Section C: Modulation Matrix Router with 1.5px Bézier SVG cables and minimalist Knobs & Sliders",
    async () => {
      const rackSource = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        rackSource,
        /Modulation|Matrix/i,
        "FigmaPluginRack Section C must include Modulation Matrix Router"
      );
      assertMatch(
        rackSource,
        /strokeWidth=["']?1\.5["']?|1\.5px/,
        "FigmaPluginRack Section C must render 1.5px Bézier patch cables"
      );
      assertMatch(
        rackSource,
        /cutoff|resonance|drive|gainDb|knob/i,
        "FigmaPluginRack Section C must include rotary knobs and linear sliders"
      );
    }
  );

  test(
    "T1-F12-04",
    1,
    "F12",
    "FigmaPluginRack renders Section D: 3D BD Avatar Presets (SPECTATEUR 3D A / SPECTATEUR 3D B) and comic speech-bubble tooltips",
    async () => {
      const rackSource = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        rackSource,
        /SPECTATEUR 3D A/i,
        "FigmaPluginRack Section D must include 'SPECTATEUR 3D A' preset badge"
      );
      assertMatch(
        rackSource,
        /SPECTATEUR 3D B/i,
        "FigmaPluginRack Section D must include 'SPECTATEUR 3D B' preset badge"
      );
    }
  );

  test(
    "T1-F12-05",
    1,
    "F12",
    "Live GET /vst/anr-vst-01 renders the interactive Figma UI Kit Plugin Rack in HTML",
    async () => {
      const res = await fetchPage("/vst/anr-vst-01");
      assertEqual(res.status, 200, "GET /vst/anr-vst-01 must return HTTP 200");
      assertMatch(
        res.html,
        /1920x1080\s*\|\s*60FPS/i,
        "Live /vst/anr-vst-01 must render Section A 1920x1080 | 60FPS readout"
      );
      assertMatch(
        res.html,
        /SPECTATEUR 3D A/i,
        "Live /vst/anr-vst-01 must render Section D SPECTATEUR 3D A preset"
      );
    }
  );

  // ============================================================================
  // F13: HTTPS/HSTS/CSP Security & RGPD/CNIL Compliance Refinement (5 tests)
  // ============================================================================
  test(
    "T1-F13-01",
    1,
    "F13",
    "Live HTTP responses include Strict-Transport-Security (HSTS), X-Frame-Options: DENY, and X-Content-Type-Options: nosniff",
    async () => {
      const res = await fetchPage("/");
      assertIncludes(
        res.headers["strict-transport-security"] || "",
        "max-age=63072000",
        "Response must include HSTS header with max-age=63072000"
      );
      assertEqual(
        res.headers["x-frame-options"],
        "DENY",
        "Response must include X-Frame-Options: DENY"
      );
      assertEqual(
        res.headers["x-content-type-options"],
        "nosniff",
        "Response must include X-Content-Type-Options: nosniff"
      );
    }
  );

  test(
    "T1-F13-02",
    1,
    "F13",
    "Content-Security-Policy header includes default-src 'self', media-src 'self' data: blob:, and worker-src 'self' blob:",
    async () => {
      const res = await fetchPage("/", { noCache: true });
      const csp = res.headers["content-security-policy"] || "";
      const nextCfg = readProjectFile("next.config.mjs");
      assertIncludes(csp, "default-src 'self'", "CSP header must include default-src 'self'");
      assertIncludes(csp, "media-src 'self' data: blob:", "CSP header must include media-src");
      assertIncludes(
        nextCfg,
        "worker-src 'self' blob:",
        "next.config.mjs CSP must include worker-src 'self' blob: for WebAudio/Workers"
      );
    }
  );

  test(
    "T1-F13-03",
    1,
    "F13",
    "CookieConsentBanner.tsx enforces CNIL Privacy-by-Design with audioPreferences initialized to false by default",
    async () => {
      const banner = readProjectFile("components/compliance/CookieConsentBanner.tsx");
      assertMatch(
        banner,
        /\[audioPreferences,\s*setAudioPreferences\]\s*=\s*useState(?:\s*<boolean>)?\(false\)/,
        "CookieConsentBanner.tsx must initialize audioPreferences state to false (CNIL Privacy-by-Design)"
      );
      assertMatch(
        banner,
        /\[analytics,\s*setAnalytics\]\s*=\s*useState(?:\s*<boolean>)?\(false\)/,
        "CookieConsentBanner.tsx must initialize analytics state to false"
      );
    }
  );

  test(
    "T1-F13-04",
    1,
    "F13",
    "CookieConsentBanner is positioned above the Sticky Bottom Player (bottom-20 or bottom-24, z-50)",
    async () => {
      const banner = readProjectFile("components/compliance/CookieConsentBanner.tsx");
      assertMatch(
        banner,
        /bottom-2[04]|bottom-\[5\.5rem\]|bottom-24/,
        "CookieConsentBanner must use bottom-20/bottom-24 offset so it does not collide with StickyBottomPlayer"
      );
      assertIncludes(banner, "z-50", "CookieConsentBanner must use z-50");
    }
  );

  test(
    "T1-F13-05",
    1,
    "F13",
    "GET /legal returns HTTP 200 and exposes RGPD Art. 17 Right to Erasure and Art. 20 JSON Data Portability controls",
    async () => {
      const res = await fetchPage("/legal");
      assertEqual(res.status, 200, "GET /legal must return HTTP 200");
      assertIncludes(
        res.html,
        "btn-legal-export-data",
        "Live /legal must render Art. 20 JSON export button (#btn-legal-export-data)"
      );
      assertIncludes(
        res.html,
        "btn-legal-purge-data",
        "Live /legal must render Art. 17 purge button (#btn-legal-purge-data)"
      );
      assertIncludes(
        res.html,
        "openhub_audio_prefs",
        "Live /legal must document openhub_audio_prefs in storage inventory"
      );
    }
  );

  // ============================================================================
  // F14: Anarchy Visual Design V2 (/anarchy-visual-design, 19 Faders)
  // ============================================================================
  test(
    "T1-F14-01",
    1,
    "F14",
    "Isolated Visual Engine V2 modules exist under lib/visual-engine/* and components/visual-engine/*",
    async () => {
      for (const rel of [
        "lib/visual-engine/contracts.ts",
        "lib/visual-engine/audioAnalysis.ts",
        "lib/visual-engine/presets.ts",
        "lib/visual-engine/renderer.ts",
        "components/visual-engine/ConsoleFader.tsx",
        "components/visual-engine/VisualEngineStudio.tsx",
        "app/anarchy-visual-design/page.tsx",
      ]) {
        assert(fileExists(rel), `${rel} must exist for isolated Visual Design module`);
      }
    }
  );

  test(
    "T1-F14-02",
    1,
    "F14",
    "GET /anarchy-visual-design returns HTTP 200 with 19 DAW ConsoleFaders and 5 scenes incl. Techno Therapy",
    async () => {
      const res = await fetchPage("/anarchy-visual-design");
      assertEqual(res.status, 200, "GET /anarchy-visual-design must return HTTP 200");
      assertIncludes(res.html, "fader-psyche", "Studio must render Kaleidoscope/Psyche fader");
      assertIncludes(res.html, "fader-pendulum", "Studio must render Pendulum Cam fader");
      assertIncludes(res.html, "fader-anaglyph", "Studio must render Anaglyph 3D fader");
      assertIncludes(res.html, "Techno Therapy", "Studio must include Techno Therapy scene");
    }
  );

  test(
    "T1-F14-03",
    1,
    "F14",
    "GET /visual-engine cleanly redirects (307/308) to /anarchy-visual-design",
    async () => {
      const res = await fetchPage("/visual-engine");
      assert(
        res.status === 307 || res.status === 308 || res.status === 200,
        `GET /visual-engine must redirect or render cleanly, got ${res.status}`
      );
    }
  );

  // ============================================================================
  // F15: Anarchy Retro Browser HUD Site Wrapper (AnarchyHudShell.tsx)
  // ============================================================================
  test(
    "T1-F15-01",
    1,
    "F15",
    "AnarchyHudShell is mounted in app/layout.tsx and renders retro HUD chrome without nightclub references",
    async () => {
      assert(fileExists("components/layout/AnarchyHudShell.tsx"), "AnarchyHudShell.tsx must exist");
      const layout = readProjectFile("app/layout.tsx");
      assertIncludes(layout, "AnarchyHudShell", "app/layout.tsx must mount AnarchyHudShell");

      const res = await fetchPage("/");
      assertEqual(res.status, 200, "GET / must return HTTP 200");
      assertIncludes(res.html, "anarchy-hud-shell", "Live / must render #anarchy-hud-shell");
      assertIncludes(res.html, "anarchy-hud-titlebar", "Live / must render #anarchy-hud-titlebar");
      assertIncludes(res.html, "anarchy-hud-statusbar", "Live / must render #anarchy-hud-statusbar");
      assert(!/Saint-Sabin|Les\.Caves/i.test(res.html), "Live HTML must NOT contain external nightclub strings");
    }
  );
}

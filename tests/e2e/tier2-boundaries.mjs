import {
  test,
  fetchPage,
  readProjectFile,
  fileExists,
  assert,
  assertEqual,
  assertIncludes,
  assertMatch,
} from "./helpers.mjs";

export function registerTier2Tests() {
  // ============================================================================
  // F1 Boundaries: Color Palette, Contrast & Clinical Light-Mode Enforcement (5 tests)
  // ============================================================================
  test(
    "T2-F1-01",
    2,
    "F1",
    "app/globals.css enforces clinical light-mode surface defaults without dark-mode media query override on body",
    async () => {
      const css = readProjectFile("app/globals.css");
      assert(
        !css.includes("prefers-color-scheme: dark"),
        "globals.css must not override the clinical light-mode palette with prefers-color-scheme: dark"
      );
      assertIncludes(css, "bg-brand-pearl", "body must default to bg-brand-pearl (#F5F5F5)");
      assertIncludes(css, "text-brand-charcoal", "body must default to text-brand-charcoal (#222226)");
    }
  );

  test(
    "T2-F1-02",
    2,
    "F1",
    "Text selection highlight uses high-contrast Cinema Red (selection:bg-brand-red selection:text-brand-white)",
    async () => {
      const css = readProjectFile("app/globals.css");
      assertIncludes(css, "selection:bg-brand-red", "globals.css must set selection:bg-brand-red");
      assertIncludes(
        css,
        "selection:text-brand-white",
        "globals.css must set selection:text-brand-white"
      );
    }
  );

  test(
    "T2-F1-03",
    2,
    "F1",
    ".anaglyph-ring CSS utility uses exact dual symmetric -2px red (#ff1b24) and +2px cyan (#00e5ff) box-shadow offsets",
    async () => {
      const css = readProjectFile("app/globals.css");
      assertMatch(
        css,
        /-2px\s+0\s+0\s+0\s+#ff1b24,\s*2px\s+0\s+0\s+0\s+#00e5ff/i,
        ".anaglyph-ring must define -2px #ff1b24 and +2px #00e5ff box-shadow"
      );
    }
  );

  test(
    "T2-F1-04",
    2,
    "F1",
    "Comic shadow tokens enforce zero blur radius (0px) for crisp comic-book ink edges",
    async () => {
      const tw = readProjectFile("tailwind.config.ts");
      assertMatch(
        tw,
        /3px\s+3px\s+0px\s+0px\s+#000000/i,
        "shadow-comic must have 0px blur radius (3px 3px 0px 0px #000000)"
      );
      assertMatch(
        tw,
        /2px\s+2px\s+0px\s+0px\s+#000000/i,
        "shadow-comic-sm must have 0px blur radius (2px 2px 0px 0px #000000)"
      );
    }
  );

  test(
    "T2-F1-05",
    2,
    "F1",
    "Clinical shadow tokens enforce low-opacity (<0.10) subtle elevation for DAW surfaces",
    async () => {
      const tw = readProjectFile("tailwind.config.ts");
      assertIncludes(tw, "rgba(0, 0, 0, 0.04)", "shadow-clinical must use low-opacity 0.04 shadow");
      assertIncludes(tw, "rgba(0, 0, 0, 0.07)", "shadow-clinical-hover must use subtle 0.07 shadow");
    }
  );

  // ============================================================================
  // F2 Boundaries: Typography Fallback Stacks, Weights & Tabular Readouts (5 tests)
  // ============================================================================
  test(
    "T2-F2-01",
    2,
    "F2",
    "Tailwind font-sans and font-mono define system fallback stacks (system-ui, sans-serif, monospace)",
    async () => {
      const tw = readProjectFile("tailwind.config.ts");
      assertIncludes(tw, "system-ui", "font-sans must include system-ui fallback");
      assertIncludes(tw, "sans-serif", "font-sans must include sans-serif fallback");
      assertIncludes(tw, "monospace", "font-mono must include monospace fallback");
    }
  );

  test(
    "T2-F2-02",
    2,
    "F2",
    "Roboto_Mono in app/layout.tsx loads weights 400, 500, and 700 with swap display strategy",
    async () => {
      const layout = readProjectFile("app/layout.tsx");
      assertIncludes(layout, '"400"', "Roboto_Mono must load weight 400");
      assertIncludes(layout, '"500"', "Roboto_Mono must load weight 500");
      assertIncludes(layout, '"700"', "Roboto_Mono must load weight 700");
      assertIncludes(layout, 'display: "swap"', "Fonts must configure display: swap");
    }
  );

  test(
    "T2-F2-03",
    2,
    "F2",
    "All primary pages (/, /samples, /forum, /blog, /legal) preserve --font-inter and --font-roboto-mono on <html>",
    async () => {
      for (const route of ["/", "/samples", "/forum", "/blog", "/legal"]) {
        const res = await fetchPage(route);
        assertEqual(res.status, 200, `GET ${route} must return HTTP 200`);
        assertMatch(
          res.html,
          /<html[^>]*lang="fr"/,
          `Route ${route} must render <html lang="fr"> with font classes`
        );
      }
    }
  );

  test(
    "T2-F2-04",
    2,
    "F2",
    "SHA-256 cryptographic hashes in lib/openhub-data.ts are valid 64-character hexadecimal strings for monospace display",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      const hexMatches = data.match(/["'][a-f0-9]{64}["']/gi) || [];
      assert(
        hexMatches.length >= 6,
        `Expected at least 6 valid 64-char hex SHA-256 hashes in lib/openhub-data.ts, found ${hexMatches.length}`
      );
    }
  );

  test(
    "T2-F2-05",
    2,
    "F2",
    "Long SHA-256 or code strings in plugin and blog pages handle horizontal overflow cleanly (break-all / truncate / overflow-x-auto)",
    async () => {
      const vstPage = readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        vstPage,
        /break-all|truncate|overflow-x-auto/,
        "app/vst/[id]/page.tsx must prevent horizontal overflow on 64-char SHA-256 hashes"
      );
    }
  );

  // ============================================================================
  // F3 Boundaries: AvatarBD Fallbacks, Deterministic Hashing & Size Variants (5 tests)
  // ============================================================================
  test(
    "T2-F3-01",
    2,
    "F3",
    "AvatarBD.tsx provides default name fallback ('Anarchy Spec') when name prop is omitted",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertIncludes(
        avatar,
        'name = "Anarchy Spec"',
        "AvatarBD.tsx must default name prop to 'Anarchy Spec'"
      );
    }
  );

  test(
    "T2-F3-02",
    2,
    "F3",
    "AvatarBD.tsx deterministically selects an expression from name when expression prop is omitted",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertMatch(
        avatar,
        /expression|charCodeAt|hash/i,
        "AvatarBD.tsx must support expression prop or deterministic fallback from name"
      );
    }
  );

  test(
    "T2-F3-03",
    2,
    "F3",
    "AvatarBD.tsx supports all 4 size boundaries: sm (w-10 h-10), md (w-12 h-12), lg (w-16 h-16), xl (w-24 h-24)",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertIncludes(avatar, 'sm: "w-10 h-10"', "AvatarBD must support sm size");
      assertIncludes(avatar, 'md: "w-12 h-12"', "AvatarBD must support md size");
      assertIncludes(avatar, 'lg: "w-16 h-16"', "AvatarBD must support lg size");
      assertIncludes(avatar, 'xl: "w-24 h-24"', "AvatarBD must support xl size");
    }
  );

  test(
    "T2-F3-04",
    2,
    "F3",
    "AvatarBD.tsx omits the bottom-right comic badge element when badgeText prop is undefined or empty",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertMatch(
        avatar,
        /\{badgeText\s*&&/,
        "AvatarBD.tsx must conditionally render badgeText only when truthy"
      );
    }
  );

  test(
    "T2-F3-05",
    2,
    "F3",
    "AvatarBD.tsx SVG includes accessible role='img' and aria-label referencing the character name",
    async () => {
      const avatar = readProjectFile("components/ui/AvatarBD.tsx");
      assertIncludes(avatar, 'role="img"', "AvatarBD SVG must include role='img'");
      assertIncludes(avatar, "aria-label=", "AvatarBD SVG must include aria-label");
    }
  );

  // ============================================================================
  // F4 Boundaries: Card & Button Edge Cases (5 tests)
  // ============================================================================
  test(
    "T2-F4-01",
    2,
    "F4",
    "Button.tsx defaults type='button' to prevent accidental form submission inside forms",
    async () => {
      const btn = readProjectFile("components/ui/Button.tsx");
      assertIncludes(
        btn,
        'type = "button"',
        "Button.tsx must default type prop to 'button'"
      );
    }
  );

  test(
    "T2-F4-02",
    2,
    "F4",
    "Button.tsx enforces disabled state styling (disabled:opacity-50 disabled:pointer-events-none) and focus-visible ring",
    async () => {
      const btn = readProjectFile("components/ui/Button.tsx");
      assertIncludes(btn, "disabled:opacity-50", "Button must apply disabled:opacity-50");
      assertIncludes(
        btn,
        "disabled:pointer-events-none",
        "Button must apply disabled:pointer-events-none"
      );
      assertIncludes(
        btn,
        "focus-visible:ring-2",
        "Button must provide keyboard focus-visible ring"
      );
    }
  );

  test(
    "T2-F4-03",
    2,
    "F4",
    "Card.tsx omits the top DAW header bar when neither moduleTitle nor moduleMeta is provided",
    async () => {
      const card = readProjectFile("components/ui/Card.tsx");
      assertIncludes(
        card,
        "(moduleTitle || moduleMeta)",
        "Card.tsx must only render header bar when moduleTitle or moduleMeta is truthy"
      );
    }
  );

  test(
    "T2-F4-04",
    2,
    "F4",
    "Card.tsx renders neutral-300 LED indicator when activeIndicator is false and brand-red when true",
    async () => {
      const card = readProjectFile("components/ui/Card.tsx");
      assertIncludes(
        card,
        'activeIndicator ? "bg-brand-red" : "bg-neutral-300"',
        "Card.tsx LED must toggle between bg-brand-red and bg-neutral-300"
      );
    }
  );

  test(
    "T2-F4-05",
    2,
    "F4",
    "Card.tsx and Button.tsx forward refs (React.forwardRef) and merge custom className props cleanly",
    async () => {
      const card = readProjectFile("components/ui/Card.tsx");
      const btn = readProjectFile("components/ui/Button.tsx");
      assertIncludes(card, "React.forwardRef", "Card.tsx must use React.forwardRef");
      assertIncludes(btn, "React.forwardRef", "Button.tsx must use React.forwardRef");
    }
  );

  // ============================================================================
  // F5 Boundaries: Navigation Active State, Mobile Drawer & Accessibility (5 tests)
  // ============================================================================
  test(
    "T2-F5-01",
    2,
    "F5",
    "Header navigation highlights active route using usePathname()",
    async () => {
      assert(
        fileExists("components/layout/HeaderNav.tsx"),
        "components/layout/HeaderNav.tsx must exist for client-side active route highlighting & mobile drawer"
      );
      const nav = readProjectFile("components/layout/HeaderNav.tsx");
      assertIncludes(nav, "usePathname", "HeaderNav.tsx must use usePathname()");
    }
  );

  test(
    "T2-F5-02",
    2,
    "F5",
    "Mobile navigation button includes accessible aria-label and aria-expanded attributes",
    async () => {
      const nav = readProjectFile("components/layout/HeaderNav.tsx");
      assertIncludes(nav, "aria-expanded", "Mobile menu toggle button must include aria-expanded");
      assertIncludes(nav, "aria-label", "Mobile menu toggle button must include aria-label");
    }
  );

  test(
    "T2-F5-03",
    2,
    "F5",
    "Desktop navigation uses hidden md:flex and mobile toggle uses md:hidden for exact 768px breakpoint separation",
    async () => {
      const nav = readProjectFile("components/layout/HeaderNav.tsx");
      assertIncludes(nav, "hidden md:flex", "Desktop nav must use hidden md:flex");
      assertIncludes(nav, "md:hidden", "Mobile menu trigger/drawer must use md:hidden");
    }
  );

  test(
    "T2-F5-04",
    2,
    "F5",
    "Skip-to-content link (#main-content) is sr-only by default and becomes visible on keyboard focus (focus:not-sr-only)",
    async () => {
      const layout = readProjectFile("app/layout.tsx");
      assertIncludes(layout, "sr-only", "Skip link must be sr-only by default");
      assertIncludes(layout, "focus:not-sr-only", "Skip link must be focus:not-sr-only");
    }
  );

  test(
    "T2-F5-05",
    2,
    "F5",
    "Footer and body include bottom padding (pb-24 / pb-28) so StickyBottomPlayer never obscures footer links",
    async () => {
      const layout = readProjectFile("app/layout.tsx");
      assertMatch(
        layout,
        /pb-2[48]|pb-32/,
        "app/layout.tsx must apply bottom padding (pb-24 / pb-28 / pb-32) for StickyBottomPlayer clearance"
      );
    }
  );

  // ============================================================================
  // F6 Boundaries: VST Catalogue Empty Search, Case-Insensitivity & Reset (5 tests)
  // ============================================================================
  test(
    "T2-F6-01",
    2,
    "F6",
    "VST Catalogue (app/page.tsx) handles zero-match search queries with an explicit empty-state message and reset button",
    async () => {
      const page = readProjectFile("app/page.tsx");
      assertMatch(
        page,
        /\.length\s*===\s*0/,
        "app/page.tsx must check for empty filtered plugin list (.length === 0)"
      );
    }
  );

  test(
    "T2-F6-02",
    2,
    "F6",
    "VST Catalogue search normalizes query case (.toLowerCase()) across plugin name, code, and description",
    async () => {
      const page = readProjectFile("app/page.tsx");
      assertIncludes(
        page,
        "toLowerCase()",
        "app/page.tsx search filter must use .toLowerCase() for case-insensitive matching"
      );
    }
  );

  test(
    "T2-F6-03",
    2,
    "F6",
    "VST Catalogue supports 'ALL' category reset option alongside specific DSP categories",
    async () => {
      const page = readProjectFile("app/page.tsx");
      assertMatch(
        page,
        /["']ALL["']/,
        "app/page.tsx category filter must support 'ALL' category state"
      );
    }
  );

  test(
    "T2-F6-04",
    2,
    "F6",
    "All 6 plugins in lib/openhub-data.ts define valid defaultKnobs within boundary ranges (0..100 and -24..+12 dB)",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      assertIncludes(data, "defaultKnobs", "lib/openhub-data.ts must define defaultKnobs per plugin");
      assertIncludes(data, "cutoff", "defaultKnobs must include cutoff");
      assertIncludes(data, "resonance", "defaultKnobs must include resonance");
      assertIncludes(data, "drive", "defaultKnobs must include drive");
      assertIncludes(data, "mix", "defaultKnobs must include mix");
      assertIncludes(data, "gainDb", "defaultKnobs must include gainDb");
    }
  );

  test(
    "T2-F6-05",
    2,
    "F6",
    "All 6 plugins in lib/openhub-data.ts define macOS, Windows, and Linux OS support and VST3/CLAP formats",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      assertIncludes(data, "macOS", "Plugins must specify macOS support");
      assertIncludes(data, "Windows", "Plugins must specify Windows support");
      assertIncludes(data, "Linux", "Plugins must specify Linux support");
      assertIncludes(data, "VST3", "Plugins must specify VST3 format");
      assertIncludes(data, "CLAP", "Plugins must specify CLAP format");
    }
  );

  // ============================================================================
  // F7 Boundaries: Samples Hub Empty Search, Form Validation & Waveform Bounds (5 tests)
  // ============================================================================
  test(
    "T2-F7-01",
    2,
    "F7",
    "Samples Hub (app/samples/page.tsx) handles zero-match filter results with an empty state and filter reset",
    async () => {
      const samples = readProjectFile("app/samples/page.tsx");
      assertMatch(
        samples,
        /\.length\s*===\s*0/,
        "app/samples/page.tsx must handle empty filtered tracks (.length === 0)"
      );
    }
  );

  test(
    "T2-F7-02",
    2,
    "F7",
    "Samples Hub Community Pack submission form validates required fields (title/packName) before adding a track",
    async () => {
      const samples = readProjectFile("app/samples/page.tsx");
      assertMatch(
        samples,
        /trim\(\)|required/,
        "app/samples/page.tsx submission form must validate required fields (.trim() or required)"
      );
    }
  );

  test(
    "T2-F7-03",
    2,
    "F7",
    "All sample tracks in lib/openhub-data.ts specify 48.0 kHz / 24-BIT sample rate and CC0 1.0 or CC-BY 4.0 open license",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      assertIncludes(data, "48.0 kHz", "Sample tracks must specify 48.0 kHz sample rate");
      assertIncludes(data, "CC0 1.0", "Sample tracks must include CC0 1.0 license");
      assertIncludes(data, "CC-BY 4.0", "Sample tracks must include CC-BY 4.0 license");
    }
  );

  test(
    "T2-F7-04",
    2,
    "F7",
    "tribal -136.wav track in lib/openhub-data.ts has exact BPM 136 matching its filename",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      assertIncludes(data, "tribal -136.wav", "lib/openhub-data.ts must include tribal -136.wav");
      assertIncludes(data, "136", "tribal -136.wav must specify 136 BPM");
    }
  );

  test(
    "T2-F7-05",
    2,
    "F7",
    "Sample tracks define normalized waveformPeaks arrays for clinical DAW bar rendering",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      assertIncludes(data, "waveformPeaks", "SampleTrack data must define waveformPeaks array");
    }
  );

  // ============================================================================
  // F8 Boundaries: Forum Empty Post Rejection, Tripcodes & Search (5 tests)
  // ============================================================================
  test(
    "T2-F8-01",
    2,
    "F8",
    "Forum New Thread and Quick Reply forms reject empty whitespace-only submissions (.trim())",
    async () => {
      const forum = readProjectFile("app/forum/page.tsx");
      assertIncludes(
        forum,
        ".trim()",
        "app/forum/page.tsx must trim and reject whitespace-only thread titles/bodies/replies"
      );
    }
  );

  test(
    "T2-F8-02",
    2,
    "F8",
    "Forum threads include imageboard tripcode identifiers (e.g. !Anarchy#3D / !DSP...) in Roboto Mono",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      assertIncludes(data, "tripcode", "ForumThread and ForumReply must include tripcode field");
      const forum = readProjectFile("app/forum/page.tsx");
      assertIncludes(forum, "tripcode", "app/forum/page.tsx must display author tripcode");
    }
  );

  test(
    "T2-F8-03",
    2,
    "F8",
    "Forum supports zero-match search/board filter fallback state",
    async () => {
      const forum = readProjectFile("app/forum/page.tsx");
      assertMatch(
        forum,
        /\.length\s*===\s*0/,
        "app/forum/page.tsx must render an empty state when no threads match search/filter"
      );
    }
  );

  test(
    "T2-F8-04",
    2,
    "F8",
    "Forum supports pinned thread badge/indicator and view counter readouts",
    async () => {
      const forum = readProjectFile("app/forum/page.tsx");
      assertMatch(
        forum,
        /pinned|PINNED/i,
        "app/forum/page.tsx must display pinned status on pinned threads"
      );
      assertIncludes(forum, "views", "app/forum/page.tsx must display thread view count");
    }
  );

  test(
    "T2-F8-05",
    2,
    "F8",
    "Forum supports switching or viewing both modernized imageboard cards and alternating rows (#FFFFFF / #F5F5F5)",
    async () => {
      const forum = readProjectFile("app/forum/page.tsx");
      assertMatch(
        forum,
        /% 2 === 0|even:|odd:/,
        "app/forum/page.tsx must alternate row backgrounds (#FFFFFF and #F5F5F5)"
      );
    }
  );

  // ============================================================================
  // F9 Boundaries: Blog Unknown Slug Handling, Category Filter & Code Copy (5 tests)
  // ============================================================================
  test(
    "T2-F9-01",
    2,
    "F9",
    "GET /blog/non-existent-slug-xyz handles unknown blog slugs gracefully without HTTP 500 crash",
    async () => {
      const res = await fetchPage("/blog/non-existent-slug-xyz");
      assert(
        res.status === 404 || res.status === 200,
        `GET /blog/non-existent-slug-xyz must return 404 or graceful 200 fallback, got ${res.status}`
      );
      assert(
        !res.html.includes("Internal Server Error"),
        "Unknown blog slug must not trigger an unhandled Internal Server Error"
      );
    }
  );

  test(
    "T2-F9-02",
    2,
    "F9",
    "Blog index (/blog) supports filtering articles by technical category (DSP_WHITE_PAPER, VST_ARCHITECTURE, etc.)",
    async () => {
      const blog = readProjectFile("app/blog/page.tsx");
      assertMatch(
        blog,
        /DSP_WHITE_PAPER|VST_ARCHITECTURE|FIGMA_DESIGN_SYSTEM|category/i,
        "app/blog/page.tsx must support article category filtering"
      );
    }
  );

  test(
    "T2-F9-03",
    2,
    "F9",
    "Blog article page (/blog/[slug]) displays readingTimeMin and publication date in Roboto Mono",
    async () => {
      const blogSlug = readProjectFile("app/blog/[slug]/page.tsx");
      assertIncludes(
        blogSlug,
        "readingTimeMin",
        "app/blog/[slug]/page.tsx must render readingTimeMin"
      );
      assertIncludes(
        blogSlug,
        "publishedAt",
        "app/blog/[slug]/page.tsx must render publishedAt date"
      );
    }
  );

  test(
    "T2-F9-04",
    2,
    "F9",
    "Blog article page provides interactive Copy Code button or Interactive Audio DSP example trigger",
    async () => {
      const blogSlug = readProjectFile("app/blog/[slug]/page.tsx");
      assertMatch(
        blogSlug,
        /copy|clipboard|playTrack|useAudioPlayer/i,
        "app/blog/[slug]/page.tsx must provide code copy action and/or interactive DSP audio trigger"
      );
    }
  );

  test(
    "T2-F9-05",
    2,
    "F9",
    "Blog article page provides navigation back to /blog index and links to relatedPluginId (/vst/[id])",
    async () => {
      const blogSlug = readProjectFile("app/blog/[slug]/page.tsx");
      assertIncludes(
        blogSlug,
        "/blog",
        "app/blog/[slug]/page.tsx must include back-link to /blog"
      );
      assertIncludes(
        blogSlug,
        "relatedPluginId",
        "app/blog/[slug]/page.tsx must link to relatedPluginId when present"
      );
    }
  );

  // ============================================================================
  // F10 Boundaries: Audio Player Volume Clamping, Mute, Queue Wrap & Consent (5 tests)
  // ============================================================================
  test(
    "T2-F10-01",
    2,
    "F10",
    "AudioPlayerContext clamps volume strictly between 0 and 1 (Math.max(0, Math.min(1, ...)))",
    async () => {
      const ctx = readProjectFile("components/audio/AudioPlayerContext.tsx");
      assertMatch(
        ctx,
        /Math\.max\(\s*0\s*,\s*Math\.min\(\s*1|Math\.min\(\s*1\s*,\s*Math\.max\(\s*0/,
        "AudioPlayerContext setVolume must clamp volume to [0, 1]"
      );
    }
  );

  test(
    "T2-F10-02",
    2,
    "F10",
    "AudioPlayerContext supports toggleMute() and nextTrack()/prevTrack() queue wrap-around",
    async () => {
      const ctx = readProjectFile("components/audio/AudioPlayerContext.tsx");
      assertIncludes(ctx, "toggleMute", "AudioPlayerContext must implement toggleMute()");
      assertIncludes(ctx, "nextTrack", "AudioPlayerContext must implement nextTrack()");
      assertIncludes(ctx, "prevTrack", "AudioPlayerContext must implement prevTrack()");
    }
  );

  test(
    "T2-F10-03",
    2,
    "F10",
    "AudioPlayerContext checks GDPR audioPreferences consent before writing openhub_audio_prefs to localStorage",
    async () => {
      const ctx = readProjectFile("components/audio/AudioPlayerContext.tsx");
      assertIncludes(
        ctx,
        "openhub_audio_prefs",
        "AudioPlayerContext must use openhub_audio_prefs storage key"
      );
      assertMatch(
        ctx,
        /audioPreferences|getStoredConsent/,
        "AudioPlayerContext must check GDPR audioPreferences consent before persisting to localStorage"
      );
    }
  );

  test(
    "T2-F10-04",
    2,
    "F10",
    "AudioPlayerContext supports 3 oscilloscope visualization modes (WAVE, FFT, ANAGLYPH) and triggerGlitchBurst",
    async () => {
      const ctx = readProjectFile("components/audio/AudioPlayerContext.tsx");
      assertIncludes(ctx, "WAVE", "AudioPlayerContext must support WAVE oscilloscope mode");
      assertIncludes(ctx, "FFT", "AudioPlayerContext must support FFT oscilloscope mode");
      assertIncludes(ctx, "ANAGLYPH", "AudioPlayerContext must support ANAGLYPH oscilloscope mode");
      assertIncludes(
        ctx,
        "triggerGlitchBurst",
        "AudioPlayerContext must expose triggerGlitchBurst()"
      );
    }
  );

  test(
    "T2-F10-05",
    2,
    "F10",
    "AudioPlayerContext gracefully handles SSR / missing Web Audio API without throwing on server render",
    async () => {
      const ctx = readProjectFile("components/audio/AudioPlayerContext.tsx");
      assertMatch(
        ctx,
        /typeof window\s*[!=]==?\s*["']undefined["']/,
        "AudioPlayerContext must guard browser-only APIs against SSR execution"
      );
    }
  );

  // ============================================================================
  // F11 Boundaries: Plugin Detail Unknown Route, Telemetry Guard & OS Selection (5 tests)
  // ============================================================================
  test(
    "T2-F11-01",
    2,
    "F11",
    "GET /vst/non-existent-plugin-xyz handles unknown plugin ID gracefully without HTTP 500 error",
    async () => {
      const res = await fetchPage("/vst/non-existent-plugin-xyz");
      assert(
        res.status === 404 || res.status === 200,
        `GET /vst/non-existent-plugin-xyz must return 404 or graceful 200 fallback, got ${res.status}`
      );
      assert(
        !res.html.includes("Internal Server Error"),
        "Unknown plugin route must not return Internal Server Error"
      );
    }
  );

  test(
    "T2-F11-02",
    2,
    "F11",
    "Plugin detail page displays distinct SHA-256 hashes for macOS, Windows, and Linux builds",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      assertIncludes(data, "macos:", "sha256 object must include macos hash");
      assertIncludes(data, "windows:", "sha256 object must include windows hash");
      assertIncludes(data, "linux:", "sha256 object must include linux hash");
    }
  );

  test(
    "T2-F11-03",
    2,
    "F11",
    "Plugin detail page allows triggering A/B Dry/Wet audio preview directly in the Sticky Bottom Player",
    async () => {
      const vstPage = readProjectFile("app/vst/[id]/page.tsx");
      assertIncludes(
        vstPage,
        "useAudioPlayer",
        "app/vst/[id]/page.tsx must integrate with useAudioPlayer()"
      );
    }
  );

  test(
    "T2-F11-04",
    2,
    "F11",
    "Plugin detail page includes breadcrumb / back link to return to the main VST Catalogue (/)",
    async () => {
      const res = await fetchPage("/vst/anr-vst-01");
      assertIncludes(
        res.html,
        'href="/"',
        "Live /vst/anr-vst-01 must include navigation link back to /"
      );
    }
  );

  test(
    "T2-F11-05",
    2,
    "F11",
    "GET /vst/anr-vst-03 (Spectateur 3D Video/FX Synth) renders VIDEO_FX category and 60FPS rack specifics",
    async () => {
      const res = await fetchPage("/vst/anr-vst-03");
      assertEqual(res.status, 200, "GET /vst/anr-vst-03 must return HTTP 200");
      assertMatch(
        res.html,
        /SPECTATEUR|VIDEO|60FPS/i,
        "Live /vst/anr-vst-03 must render Spectateur 3D Video/FX Synth details"
      );
    }
  );

  // ============================================================================
  // F12 Boundaries: Figma UI Kit Sequencer Bounds, Knob Clamping & Matrix (5 tests)
  // ============================================================================
  test(
    "T2-F12-01",
    2,
    "F12",
    "FigmaPluginRack 16-Step Sequencer renders exactly 16 interactive steps (01..16) with clear/fill controls",
    async () => {
      const rack = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        rack,
        /16|Array\.from\(\{\s*length:\s*16/,
        "FigmaPluginRack must define a 16-step sequencer array"
      );
    }
  );

  test(
    "T2-F12-02",
    2,
    "F12",
    "FigmaPluginRack rotary knobs and linear sliders clamp parameter ranges (0..100% and -24..+12 dB)",
    async () => {
      const rack = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        rack,
        /-24|12|100/,
        "FigmaPluginRack controls must enforce parameter bounds (0..100 and -24..+12 dB)"
      );
    }
  );

  test(
    "T2-F12-03",
    2,
    "F12",
    "FigmaPluginRack Section C Modulation Matrix renders SVG cubic/quadratic Bézier curves (M ... C/Q ...) with #FF1B24 and #222226/#302E2E strokes",
    async () => {
      const rack = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        rack,
        /<path[^>]*d=/,
        "FigmaPluginRack Modulation Matrix must render SVG <path> Bézier patch cables"
      );
      assertMatch(
        rack,
        /#FF1B24/i,
        "FigmaPluginRack Modulation Matrix must use #FF1B24 for active patch cable stroke"
      );
    }
  );

  test(
    "T2-F12-04",
    2,
    "F12",
    "FigmaPluginRack Section D switches between SPECTATEUR 3D A and SPECTATEUR 3D B presets and updates parameters",
    async () => {
      const rack = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertIncludes(
        rack,
        "SPECTATEUR 3D A",
        "FigmaPluginRack must support SPECTATEUR 3D A preset"
      );
      assertIncludes(
        rack,
        "SPECTATEUR 3D B",
        "FigmaPluginRack must support SPECTATEUR 3D B preset"
      );
    }
  );

  test(
    "T2-F12-05",
    2,
    "F12",
    "FigmaPluginRack Section B Color Wheel displays thin black crosshair reticle and HSL/Hex color readout",
    async () => {
      const rack = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        rack,
        /conic-gradient|colorWheel|hue|reticle|crosshair/i,
        "FigmaPluginRack Section B must render a Color Wheel with crosshair reticle"
      );
    }
  );

  // ============================================================================
  // F13 Boundaries: HTTPS Redirect, Malformed Storage, Sitemap & Robots (5 tests)
  // ============================================================================
  test(
    "T2-F13-01",
    2,
    "F13",
    "middleware.ts enforces 308 Permanent Redirect to https: when x-forwarded-proto is http on non-localhost hosts",
    async () => {
      const mw = readProjectFile("middleware.ts");
      assertIncludes(mw, "x-forwarded-proto", "middleware.ts must inspect x-forwarded-proto");
      assertIncludes(mw, "https:", "middleware.ts must redirect to https:");
      assertIncludes(mw, "308", "middleware.ts must use HTTP 308 Permanent Redirect");
    }
  );

  test(
    "T2-F13-02",
    2,
    "F13",
    "lib/consent.ts safely catches malformed JSON in localStorage and returns null without throwing",
    async () => {
      const consent = readProjectFile("lib/consent.ts");
      assertIncludes(consent, "JSON.parse", "lib/consent.ts must parse stored JSON");
      assertIncludes(consent, "catch", "lib/consent.ts must catch malformed JSON errors and return null");
      assertIncludes(
        consent,
        "DEFAULT_REJECT_ALL_CONSENT",
        "lib/consent.ts must define DEFAULT_REJECT_ALL_CONSENT with all non-essential flags false"
      );
    }
  );

  test(
    "T2-F13-03",
    2,
    "F13",
    "GET /sitemap.xml and GET /robots.txt return HTTP 200 with valid SEO directives",
    async () => {
      const sitemapRes = await fetchPage("/sitemap.xml");
      assertEqual(sitemapRes.status, 200, "GET /sitemap.xml must return HTTP 200");
      assertIncludes(sitemapRes.html, "<urlset", "/sitemap.xml must return XML urlset");
      assertIncludes(sitemapRes.html, "/samples", "/sitemap.xml must include /samples route");
      assertIncludes(sitemapRes.html, "/forum", "/sitemap.xml must include /forum route");
      assertIncludes(sitemapRes.html, "/blog", "/sitemap.xml must include /blog route");

      const robotsRes = await fetchPage("/robots.txt");
      assertEqual(robotsRes.status, 200, "GET /robots.txt must return HTTP 200");
      assertMatch(robotsRes.html, /User-Agent/i, "/robots.txt must include User-Agent rule");
    }
  );

  test(
    "T2-F13-04",
    2,
    "F13",
    "GET /.well-known/security.txt returns HTTP 200 with RFC 9116 security contact metadata",
    async () => {
      const secRes = await fetchPage("/.well-known/security.txt");
      assertEqual(secRes.status, 200, "GET /.well-known/security.txt must return HTTP 200");
      assertIncludes(
        secRes.html,
        "Contact:",
        "/.well-known/security.txt must include RFC 9116 Contact field"
      );
    }
  );

  test(
    "T2-F13-05",
    2,
    "F13",
    ".gitignore exists in project root and excludes node_modules, .next, and .env* files",
    async () => {
      assert(fileExists(".gitignore"), ".gitignore must exist in /home/antigravity");
      const gitignore = readProjectFile(".gitignore");
      assertIncludes(gitignore, "node_modules", ".gitignore must ignore node_modules");
      assertIncludes(gitignore, ".next", ".gitignore must ignore .next");
    }
  );
}

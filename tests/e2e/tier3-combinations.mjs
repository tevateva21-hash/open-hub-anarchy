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

export function registerTier3Tests() {
  // ============================================================================
  // Tier 3: Cross-Feature Pairwise Combinations (15 tests)
  // ============================================================================

  // 1. F6 × F10: Home VST Catalogue TEST_SIGNAL driving Sticky Bottom Audio Player
  test(
    "T3-C01",
    3,
    "F6+F10",
    "Home VST Catalogue (app/page.tsx) connects VST plugin cards to AudioPlayerContext via playTrack() with VST_DEMO sourceType",
    async () => {
      const home = readProjectFile("app/page.tsx");
      assertIncludes(
        home,
        "useAudioPlayer",
        "Home VST catalogue must consume useAudioPlayer() from AudioPlayerContext"
      );
      assertIncludes(
        home,
        "playTrack",
        "Home VST catalogue must invoke playTrack() when user triggers TEST_SIGNAL"
      );
      assertMatch(
        home,
        /VST_DEMO|anr-vst-/,
        "Home VST catalogue must pass VST plugin metadata to Sticky Bottom Player"
      );
    }
  );

  // 2. F7 × F10: Samples Hub (/samples) driving Sticky Bottom Audio Player
  test(
    "T3-C02",
    3,
    "F7+F10",
    "Samples Hub (app/samples/page.tsx) connects Google Drive .wav tracks to Sticky Bottom Player with SAMPLE_WAV sourceType",
    async () => {
      const samples = readProjectFile("app/samples/page.tsx");
      assertIncludes(
        samples,
        "useAudioPlayer",
        "Samples Hub must consume useAudioPlayer()"
      );
      assertIncludes(
        samples,
        "playTrack",
        "Samples Hub must invoke playTrack() for .wav stem preview"
      );
      const res = await fetchPage("/samples");
      assertIncludes(
        res.html,
        "fixed bottom-0",
        "Live /samples page must render the persistent StickyBottomPlayer alongside sample cards"
      );
    }
  );

  // 3. F10 × F13: Sticky Bottom Player & AudioPlayerContext respecting GDPR openhub_audio_prefs consent
  test(
    "T3-C03",
    3,
    "F10+F13",
    "AudioPlayerContext synchronizes with lib/consent.ts (getStoredConsent & openhub:consent-updated) before writing openhub_audio_prefs",
    async () => {
      const ctx = readProjectFile("components/audio/AudioPlayerContext.tsx");
      assertIncludes(
        ctx,
        "getStoredConsent",
        "AudioPlayerContext must import/call getStoredConsent from lib/consent"
      );
      assertIncludes(
        ctx,
        "openhub_audio_prefs",
        "AudioPlayerContext must manage openhub_audio_prefs only when audioPreferences consent is granted"
      );
      assertIncludes(
        ctx,
        "openhub:consent-updated",
        "AudioPlayerContext must listen to openhub:consent-updated events to purge/update preferences"
      );
    }
  );

  // 4. F11 × F13: Plugin Download Telemetry respecting GDPR analytics consent
  test(
    "T3-C04",
    3,
    "F11+F13",
    "Plugin detail page (/vst/[id]) checks GDPR analytics consent in lib/consent.ts before incrementing openhub_vst_telemetry",
    async () => {
      const vstPage = readProjectFile("app/vst/[id]/page.tsx");
      assertIncludes(
        vstPage,
        "getStoredConsent",
        "Plugin detail page must call getStoredConsent() before telemetry logging"
      );
      assertIncludes(
        vstPage,
        "openhub_vst_telemetry",
        "Plugin detail page must store session telemetry under openhub_vst_telemetry"
      );
    }
  );

  // 5. F5 × F10 × F13: Global Layout, Sticky Player, and Cookie Banner z-index & bottom-offset coordination
  test(
    "T3-C05",
    3,
    "F5+F10+F13",
    "Global layout (pb-28), StickyBottomPlayer (bottom-0 z-40), and CookieConsentBanner (bottom-24 z-50) prevent visual overlap",
    async () => {
      const layout = readProjectFile("app/layout.tsx");
      const player = readProjectFile("components/audio/StickyBottomPlayer.tsx");
      const banner = readProjectFile("components/compliance/CookieConsentBanner.tsx");

      assertMatch(layout, /pb-2[48]|pb-32/, "RootLayout must reserve bottom padding for StickyBottomPlayer");
      assertIncludes(player, "bottom-0", "StickyBottomPlayer must anchor at bottom-0");
      assertIncludes(player, "z-40", "StickyBottomPlayer must use z-40");
      assertMatch(banner, /bottom-2[04]/, "CookieConsentBanner must float above StickyBottomPlayer (bottom-20/24)");
      assertIncludes(banner, "z-50", "CookieConsentBanner must use z-50 above StickyBottomPlayer");
    }
  );

  // 6. F11 × F12: Plugin Detail Page embedding Interactive FigmaPluginRack with plugin-specific parameters
  test(
    "T3-C06",
    3,
    "F11+F12",
    "Plugin detail page (app/vst/[id]/page.tsx) embeds FigmaPluginRack initialized with the plugin's defaultKnobs and audioProfile",
    async () => {
      const vstPage = readProjectFile("app/vst/[id]/page.tsx");
      assertMatch(
        vstPage,
        /FigmaPluginRack/,
        "app/vst/[id]/page.tsx must mount FigmaPluginRack component"
      );
      const res = await fetchPage("/vst/anr-vst-02");
      assertEqual(res.status, 200, "GET /vst/anr-vst-02 must return HTTP 200");
      assertMatch(
        res.html,
        /1920x1080\s*\|\s*60FPS/i,
        "Live /vst/anr-vst-02 must render FigmaPluginRack Section A preview"
      );
    }
  );

  // 7. F12 × F10: FigmaPluginRack Glitch/Strobe/Invert & Sequencer coupled with Web Audio Engine
  test(
    "T3-C07",
    3,
    "F12+F10",
    "FigmaPluginRack connects to AudioPlayerContext (useAudioPlayer) so rack controls and Glitch/Strobe/Invert interact with live audio",
    async () => {
      const rack = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertIncludes(
        rack,
        "useAudioPlayer",
        "FigmaPluginRack must connect to AudioPlayerContext via useAudioPlayer()"
      );
      assertMatch(
        rack,
        /triggerGlitchBurst|playTrack|toggleWetDry|isPlaying/,
        "FigmaPluginRack must trigger or react to AudioPlayerContext playback/glitch state"
      );
    }
  );

  // 8. F8 × F3: Community Forum threads & replies rendering expressive AvatarBD presets
  test(
    "T3-C08",
    3,
    "F8+F3",
    "Community Forum (app/forum/page.tsx) passes thread and reply avatarExpression & badge props into AvatarBD",
    async () => {
      const forum = readProjectFile("app/forum/page.tsx");
      assertIncludes(forum, "AvatarBD", "Forum must render AvatarBD component");
      assertMatch(
        forum,
        /expression=|avatarExpression/,
        "Forum must pass avatarExpression into AvatarBD for distinct comic characters"
      );
      const res = await fetchPage("/forum");
      assertMatch(
        res.html,
        /#FF1B24/i,
        "Live /forum HTML must render AvatarBD SVG with #FF1B24 red 3D lens"
      );
      assertMatch(
        res.html,
        /#00E5FF/i,
        "Live /forum HTML must render AvatarBD SVG with #00E5FF cyan 3D lens"
      );
    }
  );

  // 9. F8 × F10: Forum post attached audio stem triggering Sticky Bottom Player
  test(
    "T3-C09",
    3,
    "F8+F10",
    "Community Forum threads with attachedTrackId allow 1-click playback in the Sticky Bottom Player",
    async () => {
      const forum = readProjectFile("app/forum/page.tsx");
      assertIncludes(
        forum,
        "useAudioPlayer",
        "Forum page must integrate with useAudioPlayer() for attached audio demos"
      );
      assertIncludes(
        forum,
        "playTrack",
        "Forum page must call playTrack() when playing an attached thread/reply audio stem"
      );
    }
  );

  // 10. F9 × F11: Blog technical article linking to related VST plugin page (/vst/[id])
  test(
    "T3-C10",
    3,
    "F9+F11",
    "Blog DSP article (/blog/[slug]) links its relatedPluginId directly to the corresponding /vst/[id] download page",
    async () => {
      const blogSlug = readProjectFile("app/blog/[slug]/page.tsx");
      assertIncludes(
        blogSlug,
        "relatedPluginId",
        "Blog article page must reference post.relatedPluginId"
      );
      assertIncludes(
        blogSlug,
        "/vst/",
        "Blog article page must link to /vst/[relatedPluginId]"
      );
    }
  );

  // 11. F9 × F10: Blog technical article interactive DSP audio example triggering Sticky Bottom Player
  test(
    "T3-C11",
    3,
    "F9+F10",
    "Blog DSP article (/blog/[slug]) allows playing an interactive audio demonstration in the Sticky Bottom Player",
    async () => {
      const blogSlug = readProjectFile("app/blog/[slug]/page.tsx");
      assertIncludes(
        blogSlug,
        "useAudioPlayer",
        "Blog article page must import and use useAudioPlayer()"
      );
      assertIncludes(
        blogSlug,
        "playTrack",
        "Blog article page must trigger playTrack() for interactive DSP audio examples"
      );
    }
  );

  // 12. F1 × F4 × F6: VST Catalogue Cards combining Clinical Card container, Red LED, and Comic Button
  test(
    "T3-C12",
    3,
    "F1+F4+F6",
    "Home VST Catalogue combines Clinical DAW Card (moduleTitle, activeIndicator) with Roboto Mono Buttons and 3D BD Avatars",
    async () => {
      const home = readProjectFile("app/page.tsx");
      assertIncludes(home, "Card", "Home VST catalogue must use Card component");
      assertIncludes(home, "Button", "Home VST catalogue must use Button component");
      assertIncludes(home, "AvatarBD", "Home VST catalogue must use AvatarBD component");
    }
  );

  // 13. F2 × F9: Blog single-column layout pairing Inter headings/prose with Roboto Mono DSP code & #FF1B24 callouts
  test(
    "T3-C13",
    3,
    "F2+F9",
    "Blog article page combines Inter bold headings, Roboto Mono DSP code snippets, and #FF1B24 left-border callout quotes",
    async () => {
      const data = readProjectFile("lib/openhub-data.ts");
      const slugMatch = data.match(/slug:\s*["']([a-z0-9-]+)["']/i);
      assert(slugMatch && slugMatch[1], "Must find blog slug in lib/openhub-data.ts");
      const res = await fetchPage(`/blog/${slugMatch[1]}`);
      assertEqual(res.status, 200, "Blog slug route must return HTTP 200");
      assertIncludes(res.html, "max-w-3xl", "Blog article must use max-w-3xl container");
      assertIncludes(res.html, "font-mono", "Blog article must render Roboto Mono code/metadata");
      assertMatch(
        res.html,
        /border-l-(2|4)\s+border-brand-red/,
        "Blog article must render Cinema Red left-border callout"
      );
    }
  );

  // 14. F3 × F10: StickyBottomPlayer displaying active track's audio-reactive AvatarBD character
  test(
    "T3-C14",
    3,
    "F3+F10",
    "StickyBottomPlayer renders AvatarBD with the active track's avatarExpression and audioReactive state",
    async () => {
      const player = readProjectFile("components/audio/StickyBottomPlayer.tsx");
      assertIncludes(
        player,
        "AvatarBD",
        "StickyBottomPlayer must render AvatarBD for the current track"
      );
      assertMatch(
        player,
        /expression|avatarExpression|audioReactive/,
        "StickyBottomPlayer must pass track expression / audioReactive state to AvatarBD"
      );
    }
  );

  // 15. F1 × F12: FigmaPluginRack adhering to Clinical White/Pearl + Cinema Red (#FF1B24) + Comic Black Ink palette
  test(
    "T3-C15",
    3,
    "F1+F12",
    "FigmaPluginRack combines Clinical DAW surfaces (#FFFFFF / #F5F5F5) with #FF1B24 active steps/cables and thick black ink comic badges",
    async () => {
      const rack = fileExists("components/vst/FigmaPluginRack.tsx")
        ? readProjectFile("components/vst/FigmaPluginRack.tsx")
        : readProjectFile("app/vst/[id]/page.tsx");
      assertIncludes(rack, "bg-brand-white", "FigmaPluginRack must use bg-brand-white clinical modules");
      assertIncludes(rack, "bg-brand-pearl", "FigmaPluginRack must use bg-brand-pearl rack chassis");
      assertIncludes(rack, "bg-brand-red", "FigmaPluginRack must use bg-brand-red for active sequencer steps/accents");
      assertMatch(
        rack,
        /border-(2|4)\s+border-black/,
        "FigmaPluginRack Section D must use thick black comic borders"
      );
    }
  );
}

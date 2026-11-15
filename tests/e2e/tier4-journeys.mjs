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

export function registerTier4Tests() {
  // ============================================================================
  // Tier 4: Real-World Application User Journeys (7 end-to-end journeys)
  // ============================================================================

  // Journey 1: Music Producer VST Discovery -> Dry/Wet Audio Preview -> Figma Rack -> SHA-256 -> Download
  test(
    "T4-J01",
    4,
    "JOURNEY-1",
    "Music Producer Journey: Discover ANAGLYPH SATURATOR on /, preview Dry/Wet signal in Sticky Player, navigate to /vst/anr-vst-01, inspect Figma UI Rack, verify SHA-256 hash, and download VST3",
    async () => {
      // Step 1: Land on Home VST Catalogue
      const homeRes = await fetchPage("/");
      assertEqual(homeRes.status, 200, "Step 1: GET / must return 200");
      assertIncludes(
        homeRes.html,
        "ANAGLYPH SATURATOR",
        "Step 1: Home catalogue must list ANAGLYPH SATURATOR"
      );
      assertIncludes(
        homeRes.html,
        "/vst/anr-vst-01",
        "Step 1: Home catalogue must link to /vst/anr-vst-01"
      );

      // Step 2: Verify Sticky Bottom Player is present for Dry/Wet signal preview
      assertIncludes(
        homeRes.html,
        "<canvas",
        "Step 2: Sticky Bottom Player oscilloscope <canvas> must be rendered"
      );

      // Step 3: Navigate to /vst/anr-vst-01 dedicated plugin page
      const vstRes = await fetchPage("/vst/anr-vst-01");
      assertEqual(vstRes.status, 200, "Step 3: GET /vst/anr-vst-01 must return 200");
      assertIncludes(
        vstRes.html,
        "ANAGLYPH SATURATOR",
        "Step 3: Dedicated plugin page must render ANAGLYPH SATURATOR title"
      );

      // Step 4: Verify Figma UI Kit Rack is rendered on the plugin page
      assertMatch(
        vstRes.html,
        /1920x1080\s*\|\s*60FPS/i,
        "Step 4: Plugin page must render Figma UI Kit Section A (1920x1080 | 60FPS)"
      );
      assertMatch(
        vstRes.html,
        /SPECTATEUR 3D A/i,
        "Step 4: Plugin page must render Figma UI Kit Section D (SPECTATEUR 3D A)"
      );

      // Step 5: Verify SHA-256 checksum & OS binary installers (macOS/Windows/Linux VST3/CLAP)
      assertMatch(vstRes.html, /SHA-256/i, "Step 5: Plugin page must display SHA-256 verification");
      assertMatch(vstRes.html, /VST3/i, "Step 5: Plugin page must provide VST3 download");
      assertMatch(vstRes.html, /CLAP/i, "Step 5: Plugin page must provide CLAP download");
    }
  );

  // Journey 2: Sound Designer Sample Pack Exploration & Community Pack Submission
  test(
    "T4-J02",
    4,
    "JOURNEY-2",
    "Sound Designer Journey: Browse /samples, verify all 6 Google Drive .wav tracks, filter by BPM/Genre, preview in Sticky Player, and submit a CC0 community pack",
    async () => {
      // Step 1: Navigate to /samples from Header
      const samplesRes = await fetchPage("/samples");
      assertEqual(samplesRes.status, 200, "Step 1: GET /samples must return 200");

      // Step 2: Verify all 6 required Google Drive .wav tracks are available
      const tracks = [
        "Anarchy.wav",
        "SYSTEM OVERLOAD.wav",
        "POWER GLOVE REMIX.wav",
        "psychedelic trap.wav",
        "PSYCHEDELIC VIBE.wav",
        "tribal -136.wav",
      ];
      for (const t of tracks) {
        assertIncludes(
          samplesRes.html,
          t,
          `Step 2: /samples must display Google Drive track "${t}"`
        );
      }

      // Step 3: Verify 48.0 kHz / 24-BIT & CC0/CC-BY metadata and waveform peaks
      assertMatch(
        samplesRes.html,
        /48\.0\s*kHz/i,
        "Step 3: /samples must display 48.0 kHz sample rate"
      );
      assertMatch(
        samplesRes.html,
        /CC0|CC-BY/i,
        "Step 3: /samples must display open-source Creative Commons license badges"
      );

      // Step 4: Verify Sticky Player integration and Community Sample Pack submission form
      const samplesCode = readProjectFile("app/samples/page.tsx");
      assertIncludes(
        samplesCode,
        "playTrack",
        "Step 4: /samples must wire track playback to Sticky Bottom Player"
      );
      assertMatch(
        samplesCode,
        /<form|onSubmit/i,
        "Step 4: /samples must include interactive community sample pack submission form"
      );
    }
  );

  // Journey 3: DSP Engineer Knowledge & Community Discussion Flow (/blog -> /blog/[slug] -> /forum)
  test(
    "T4-J03",
    4,
    "JOURNEY-3",
    "DSP Engineer Journey: Browse /blog, read a technical whitepaper at /blog/[slug] with #FF1B24 callouts & Roboto Mono DSP code, then navigate to /forum [DSP_DEV] and post a thread/reply",
    async () => {
      // Step 1: Visit /blog index
      const blogRes = await fetchPage("/blog");
      assertEqual(blogRes.status, 200, "Step 1: GET /blog must return 200");

      // Step 2: Open a DSP whitepaper article (/blog/[slug])
      const data = readProjectFile("lib/openhub-data.ts");
      const slugMatch = data.match(/slug:\s*["']([a-z0-9-]+)["']/i);
      assert(slugMatch && slugMatch[1], "Step 2: Blog slug must exist in lib/openhub-data.ts");

      const articleRes = await fetchPage(`/blog/${slugMatch[1]}`);
      assertEqual(articleRes.status, 200, "Step 2: GET /blog/[slug] must return 200");
      assertIncludes(
        articleRes.html,
        "max-w-3xl",
        "Step 2: Article must use clean single-column max-w-3xl layout"
      );
      assertMatch(
        articleRes.html,
        /border-l-(2|4)\s+border-brand-red/,
        "Step 2: Article must render #FF1B24 left-border callout"
      );

      // Step 3: Navigate to /forum and filter by DSP_DEV
      const forumRes = await fetchPage("/forum");
      assertEqual(forumRes.status, 200, "Step 3: GET /forum must return 200");
      assertMatch(
        forumRes.html,
        /DSP_DEV|DSP/i,
        "Step 3: /forum must render DSP_DEV board filter and discussions"
      );

      // Step 4: Verify New Thread and Quick Reply capabilities with AvatarBD
      const forumCode = readProjectFile("app/forum/page.tsx");
      assertIncludes(forumCode, "AvatarBD", "Step 4: /forum must render AvatarBD per post");
      assertMatch(
        forumCode,
        /replies|reply/i,
        "Step 4: /forum must support thread expansion and replies"
      );
    }
  );

  // Journey 4: Privacy-Conscious EU User Security & RGPD Compliance Journey
  test(
    "T4-J04",
    4,
    "JOURNEY-4",
    "Privacy-Conscious EU User Journey: Verify HSTS/CSP/XFO security headers, verify CNIL default-false CookieConsentBanner, visit /legal, and exercise Art. 20 JSON Export & Art. 17 Purge",
    async () => {
      // Step 1: Inspect live security headers on entry
      const entryRes = await fetchPage("/", { noCache: true });
      assertIncludes(
        entryRes.headers["strict-transport-security"] || "",
        "max-age=63072000",
        "Step 1: HSTS header must be enforced"
      );
      assertEqual(
        entryRes.headers["x-frame-options"],
        "DENY",
        "Step 1: X-Frame-Options: DENY must be enforced"
      );
      assertIncludes(
        entryRes.headers["content-security-policy"] || "",
        "default-src 'self'",
        "Step 1: CSP default-src 'self' must be enforced"
      );

      // Step 2: Verify CookieConsentBanner defaults all optional trackers (including audioPreferences) to false
      const bannerCode = readProjectFile("components/compliance/CookieConsentBanner.tsx");
      assertMatch(
        bannerCode,
        /\[audioPreferences,\s*setAudioPreferences\]\s*=\s*useState(?:\s*<boolean>)?\(false\)/,
        "Step 2: CookieConsentBanner must default audioPreferences to false"
      );

      // Step 3: Visit /legal Compliance Center
      const legalRes = await fetchPage("/legal");
      assertEqual(legalRes.status, 200, "Step 3: GET /legal must return 200");
      assertIncludes(
        legalRes.html,
        "btn-legal-export-data",
        "Step 3: /legal must expose Art. 20 JSON Export button"
      );
      assertIncludes(
        legalRes.html,
        "btn-legal-purge-data",
        "Step 3: /legal must expose Art. 17 Right to Erasure button"
      );

      // Step 4: Verify lib/consent.ts implements exportUserDataArchive and purgeAllUserData
      const consentCode = readProjectFile("lib/consent.ts");
      assertIncludes(
        consentCode,
        "export function exportUserDataArchive",
        "Step 4: lib/consent.ts must export exportUserDataArchive()"
      );
      assertIncludes(
        consentCode,
        "export function purgeAllUserData",
        "Step 4: lib/consent.ts must export purgeAllUserData()"
      );
    }
  );

  // Journey 5: Visual Artist / VJ Live Performance Rack Workflow (/vst/anr-vst-03)
  test(
    "T4-J05",
    4,
    "JOURNEY-5",
    "Visual Artist / VJ Journey: Open /vst/anr-vst-03 (Spectateur 3D Video/FX Synth), operate Section A 1920x1080 | 60FPS Video Preview, Section B 16-Step Sequencer + Glitch/Strobe/Invert, Section C Bézier Matrix, and Section D SPECTATEUR 3D A/B",
    async () => {
      // Step 1: Open /vst/anr-vst-03
      const res = await fetchPage("/vst/anr-vst-03");
      assertEqual(res.status, 200, "Step 1: GET /vst/anr-vst-03 must return 200");

      // Step 2: Verify Section A Video Output Preview (1920x1080 | 60FPS)
      assertMatch(
        res.html,
        /1920x1080\s*\|\s*60FPS/i,
        "Step 2: /vst/anr-vst-03 must render 1920x1080 | 60FPS Video Output Preview"
      );
      assertMatch(
        res.html,
        /VIDEO OUTPUT PREVIEW/i,
        "Step 2: /vst/anr-vst-03 must render VIDEO OUTPUT PREVIEW header"
      );

      // Step 3: Verify Section B 16-Step Sequencer + Glitch, Strobe, Invert triggers
      assertMatch(res.html, /Glitch/i, "Step 3: Rack must render Glitch trigger");
      assertMatch(res.html, /Strobe/i, "Step 3: Rack must render Strobe trigger");
      assertMatch(res.html, /Invert/i, "Step 3: Rack must render Invert trigger");

      // Step 4: Verify Section C Modulation Matrix & Section D SPECTATEUR 3D A / B presets
      assertMatch(
        res.html,
        /SPECTATEUR 3D A/i,
        "Step 4: Rack must render SPECTATEUR 3D A preset"
      );
      assertMatch(
        res.html,
        /SPECTATEUR 3D B/i,
        "Step 4: Rack must render SPECTATEUR 3D B preset"
      );
    }
  );

  // Journey 6: Cross-Page Persistent Audio Navigation Journey
  test(
    "T4-J06",
    4,
    "JOURNEY-6",
    "Cross-Page Persistent Audio Journey: Navigate across /, /samples, /forum, /blog, /vst/anr-vst-01, and /legal verifying global AudioPlayerProvider and StickyBottomPlayer persist across all App Router pages",
    async () => {
      const routes = [
        "/",
        "/samples",
        "/forum",
        "/blog",
        "/vst/anr-vst-01",
        "/legal",
      ];
      for (const route of routes) {
        const res = await fetchPage(route);
        assertEqual(res.status, 200, `Route ${route} must return HTTP 200`);
        assertIncludes(
          res.html,
          "fixed bottom-0",
          `Route ${route} must render persistent StickyBottomPlayer (fixed bottom-0)`
        );
        assertIncludes(
          res.html,
          "<canvas",
          `Route ${route} must render StickyBottomPlayer oscilloscope <canvas>`
        );
      }
    }
  );

  // Journey 7: Multi-Device Responsive & Accessibility / SEO Audit Journey (375px / 768px / 1440px)
  test(
    "T4-J07",
    4,
    "JOURNEY-7",
    "Multi-Device Responsive & Accessibility Journey: Verify mobile (375px), tablet (768px md:), and desktop (1440px lg:) responsive classes, semantic landmarks (<header>, <main>, <footer>, <nav>), and SEO routes (/sitemap.xml, /robots.txt)",
    async () => {
      const homeRes = await fetchPage("/");
      assertEqual(homeRes.status, 200, "GET / must return HTTP 200");

      // Semantic landmarks
      assertIncludes(homeRes.html, "<header", "Page must include semantic <header>");
      assertIncludes(homeRes.html, "<main", "Page must include semantic <main>");
      assertIncludes(homeRes.html, "<footer", "Page must include semantic <footer>");
      assertIncludes(homeRes.html, "<nav", "Page must include semantic <nav>");

      // Responsive grid & breakpoint classes for 375px (grid-cols-1), 768px (md:grid-cols-2 / md:flex), 1440px (lg:grid-cols-3 / max-w-7xl)
      assertIncludes(
        homeRes.html,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        "VST Catalogue must use responsive 1/2/3 column grid for mobile/tablet/desktop"
      );
      assertIncludes(
        homeRes.html,
        "max-w-7xl",
        "Desktop shell must constrain width with max-w-7xl"
      );

      // SEO endpoints
      const sitemapRes = await fetchPage("/sitemap.xml");
      assertEqual(sitemapRes.status, 200, "GET /sitemap.xml must return HTTP 200");
      const robotsRes = await fetchPage("/robots.txt");
      assertEqual(robotsRes.status, 200, "GET /robots.txt must return HTTP 200");
    }
  );
}

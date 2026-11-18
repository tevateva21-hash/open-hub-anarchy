export interface Vec3D {
  x: number;
  y: number;
  z: number;
}

interface Face3D {
  v0: Vec3D;
  v1: Vec3D;
  v2: Vec3D;
  v3?: Vec3D;
  baseColor: string;
  emissiveColor: string;
  wireframe: boolean;
  castShadow?: boolean;
  checker?: boolean;
}

interface ParticleDrawCmd {
  count: number;
  spread: number;
  speed: number;
  color: string;
  size: number;
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function parseColorRgb(col: string): [number, number, number] {
  const s = (col || "#ffffff").trim();
  if (s.startsWith("#")) {
    const clean = s.slice(1);
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16) || 0;
      const g = parseInt(clean[1] + clean[1], 16) || 0;
      const b = parseInt(clean[2] + clean[2], 16) || 0;
      return [r, g, b];
    }
    const n = parseInt(clean.slice(0, 6), 16);
    if (Number.isFinite(n)) {
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
  }
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    return [Number(m[1]) || 0, Number(m[2]) || 0, Number(m[3]) || 0];
  }
  return [220, 225, 235];
}

function rgbToHex(r: number, g: number, b: number): string {
  const ch = (v: number) =>
    clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

function shadeColorWithLightAndFog(
  baseHex: string,
  emissiveHex: string,
  ambientHex: string,
  ambientIntensity: number,
  dirLightHex: string,
  dirLightIntensity: number,
  ndotl: number,
  fogHex: string,
  fogFactor: number
): string {
  const [br, bg, bb] = parseColorRgb(baseHex);
  const [er, eg, eb] = emissiveHex ? parseColorRgb(emissiveHex) : [0, 0, 0];
  const [ar, ag, ab] = parseColorRgb(ambientHex);
  const [lr, lg, lb] = parseColorRgb(dirLightHex);
  const [fr, fg, fb] = parseColorRgb(fogHex);

  const amb = clamp(ambientIntensity, 0, 2.5);
  const diff = clamp(ndotl, 0, 1) * clamp(dirLightIntensity, 0, 3.0);
  const emGain = emissiveHex && emissiveHex !== "#000000" ? 0.42 : 0;

  let r = br * ((ar / 255) * amb * 0.55 + (lr / 255) * diff * 0.85) + er * emGain;
  let g = bg * ((ag / 255) * amb * 0.55 + (lg / 255) * diff * 0.85) + eg * emGain;
  let b = bb * ((ab / 255) * amb * 0.55 + (lb / 255) * diff * 0.85) + eb * emGain;

  const ff = clamp(fogFactor, 0, 1);
  r = r * (1 - ff) + fr * ff;
  g = g * (1 - ff) + fg * ff;
  b = b * (1 - ff) + fb * ff;

  return rgbToHex(r, g, b);
}

// Pool de sommets de cube unitaire réutilisé sans allocation GC
const UNIT_CUBE_VERTS: readonly [number, number, number][] = [
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, 0.5, 0.5],
  [-0.5, 0.5, 0.5],
];

const UNIT_CUBE_FACES: readonly [number, number, number, number][] = [
  [0, 1, 2, 3], // back (-Z)
  [5, 4, 7, 6], // front (+Z)
  [4, 0, 3, 7], // left (-X)
  [1, 5, 6, 2], // right (+X)
  [3, 2, 6, 7], // top (+Y)
  [4, 5, 1, 0], // bottom (-Y)
];

function transformBoxVerts(
  cx: number,
  cy: number,
  cz: number,
  w: number,
  h: number,
  d: number,
  rx: number,
  ry: number,
  rz: number
): Vec3D[] {
  const cosX = Math.cos(rx),
    sinX = Math.sin(rx);
  const cosY = Math.cos(ry),
    sinY = Math.sin(ry);
  const cosZ = Math.cos(rz),
    sinZ = Math.sin(rz);

  const out: Vec3D[] = new Array(8);
  for (let i = 0; i < 8; i++) {
    const [ux, uy, uz] = UNIT_CUBE_VERTS[i];
    const x0 = ux * w;
    const y0 = uy * h;
    const z0 = uz * d;

    // Rotate Z
    const x1 = x0 * cosZ - y0 * sinZ;
    const y1 = x0 * sinZ + y0 * cosZ;
    // Rotate X
    const y2 = y1 * cosX - z0 * sinX;
    const z2 = y1 * sinX + z0 * cosX;
    // Rotate Y
    const x3 = x1 * cosY + z2 * sinY;
    const z3 = -x1 * sinY + z2 * cosY;

    out[i] = { x: cx + x3, y: cy + y2, z: cz + z3 };
  }
  return out;
}

export class Anarchy3DSceneBuffer {
  private used3D = false;
  private camPos: Vec3D = { x: 0, y: 2.2, z: -7.5 };
  private camTarget: Vec3D = { x: 0, y: 0.4, z: 4.0 };
  private camFov = 65;

  private fogColor = "#12081A";
  private fogNear = 4.0;
  private fogFar = 24.0;

  private ambientColor = "#FFFFFF";
  private ambientIntensity = 0.55;

  private dirLightDir: Vec3D = { x: -0.45, y: 0.8, z: -0.4 };
  private dirLightColor = "#FFFFFF";
  private dirLightIntensity = 1.1;

  private faces: Face3D[] = [];
  private particles: ParticleDrawCmd[] = [];

  reset(): void {
    this.used3D = false;
    this.faces.length = 0;
    this.particles.length = 0;
  }

  hasCommands(): boolean {
    return this.used3D;
  }

  setCamera(
    x = 0,
    y = 2.2,
    z = -7.5,
    targetX = 0,
    targetY = 0.4,
    targetZ = 4.0,
    fov = 65
  ): void {
    this.used3D = true;
    this.camPos = { x: Number(x) || 0, y: Number(y) || 0, z: Number(z) || -7 };
    this.camTarget = {
      x: Number(targetX) || 0,
      y: Number(targetY) || 0,
      z: Number(targetZ) || 0,
    };
    this.camFov = clamp(Number(fov) || 65, 25, 130);
  }

  setFog(color = "#12081A", near = 4, far = 24): void {
    this.used3D = true;
    this.fogColor = color || "#12081A";
    this.fogNear = Math.max(0.5, Number(near) || 4);
    this.fogFar = Math.max(this.fogNear + 1, Number(far) || 24);
  }

  setAmbientLight(color = "#FFFFFF", intensity = 0.55): void {
    this.used3D = true;
    this.ambientColor = color || "#FFFFFF";
    this.ambientIntensity = clamp(Number(intensity) || 0.55, 0, 2.5);
  }

  setDirectionalLight(
    x = -4,
    y = 8,
    z = -4,
    color = "#FFFFFF",
    intensity = 1.1
  ): void {
    this.used3D = true;
    const nx = Number(x) || 0;
    const ny = Number(y) || 1;
    const nz = Number(z) || 0;
    const len = Math.hypot(nx, ny, nz) || 1;
    this.dirLightDir = { x: nx / len, y: ny / len, z: nz / len };
    this.dirLightColor = color || "#FFFFFF";
    this.dirLightIntensity = clamp(Number(intensity) || 1.1, 0, 3);
  }

  drawBox3D(
    x = 0,
    y = 0,
    z = 4,
    w = 1,
    h = 1,
    d = 1,
    rotX = 0,
    rotY = 0,
    rotZ = 0,
    color = "#2C2E35",
    emissiveColor = "#00E5FF",
    wireframe = false
  ): void {
    this.used3D = true;
    const verts = transformBoxVerts(
      Number(x) || 0,
      Number(y) || 0,
      Number(z) || 0,
      Math.max(0.05, Number(w) || 1),
      Math.max(0.05, Number(h) || 1),
      Math.max(0.05, Number(d) || 1),
      Number(rotX) || 0,
      Number(rotY) || 0,
      Number(rotZ) || 0
    );
    for (let f = 0; f < UNIT_CUBE_FACES.length; f++) {
      const [i0, i1, i2, i3] = UNIT_CUBE_FACES[f];
      this.faces.push({
        v0: verts[i0],
        v1: verts[i1],
        v2: verts[i2],
        v3: verts[i3],
        baseColor: color || "#2C2E35",
        emissiveColor: emissiveColor || "#000000",
        wireframe: Boolean(wireframe),
        castShadow: f === 5 && y > -1.35,
        checker: f === 4,
      });
    }
  }

  drawTerrain3D(
    speed = 2.0,
    amplitude = 1.0,
    color = "#1C1842",
    gridColor = "#00F6FF",
    style = "canyon",
    timeSeconds = 0,
    bass = 0
  ): void {
    this.used3D = true;
    const mode = String(style || "canyon").toLowerCase();
    const scroll = (timeSeconds * (Number(speed) || 2.0)) % 2.4;
    const amp = clamp(Number(amplitude) || 1.0, 0, 4.0) * (0.75 + bass * 0.65);
    const floorY = -1.6;

    const cols = 6;
    const rows = 7;
    const cellW = 1.9;
    const cellD = 2.4;

    for (let r = 0; r < rows; r++) {
      const z0 = -1.5 + r * cellD - scroll;
      const z1 = z0 + cellD * 0.96;

      for (let c = -cols / 2; c < cols / 2; c++) {
        const x0 = c * cellW;
        const x1 = (c + 1) * cellW;
        const distCenter = Math.abs(c + 0.5);

        let h00 = 0,
          h10 = 0,
          h11 = 0,
          h01 = 0;
        if (mode === "mountains" || mode === "canyon") {
          const ridge0 =
            distCenter >= 1.2
              ? Math.sin(r * 0.8 + c * 1.3) * 0.65 * amp + (distCenter - 1) * 0.9 * amp
              : Math.sin((r + timeSeconds * 2) * 0.7) * 0.12 * amp;
          const ridge1 =
            distCenter >= 1.2
              ? Math.cos((r + 1) * 0.8 + c * 1.3) * 0.65 * amp +
                (distCenter - 1) * 0.9 * amp
              : Math.cos((r + 1 + timeSeconds * 2) * 0.7) * 0.12 * amp;
          h00 = ridge0;
          h10 = ridge0 * 0.92;
          h11 = ridge1 * 0.92;
          h01 = ridge1;
        } else if (mode === "waves") {
          h00 = Math.sin(c * 0.9 + r * 0.7 + timeSeconds * 3) * 0.45 * amp;
          h10 = Math.sin((c + 1) * 0.9 + r * 0.7 + timeSeconds * 3) * 0.45 * amp;
          h11 =
            Math.sin((c + 1) * 0.9 + (r + 1) * 0.7 + timeSeconds * 3) * 0.45 * amp;
          h01 = Math.sin(c * 0.9 + (r + 1) * 0.7 + timeSeconds * 3) * 0.45 * amp;
        }

        const isCenterRoad = distCenter < 1.2;
        this.faces.push({
          v0: { x: x0, y: floorY + h00, z: z0 },
          v1: { x: x1, y: floorY + h10, z: z0 },
          v2: { x: x1, y: floorY + h11, z: z1 },
          v3: { x: x0, y: floorY + h01, z: z1 },
          baseColor: color || "#1C1842",
          emissiveColor: gridColor || "#00F6FF",
          wireframe: !isCenterRoad || (r + c) % 2 === 0,
          checker: isCenterRoad && (r + Math.abs(c)) % 2 === 0,
        });
      }

      // Si style "corridor" ou "dungeon", ajouter des arches 3D supérieures
      if (mode === "corridor" || mode === "dungeon" || mode === "tunnel") {
        const ceilY = 2.3 + bass * 0.35;
        const wallX = 3.2;
        this.faces.push(
          {
            v0: { x: -wallX, y: floorY, z: z0 },
            v1: { x: -wallX, y: ceilY, z: z0 },
            v2: { x: -wallX, y: ceilY, z: z1 },
            v3: { x: -wallX, y: floorY, z: z1 },
            baseColor: color || "#1C1842",
            emissiveColor: gridColor || "#00F6FF",
            wireframe: r % 2 === 0,
            checker: true,
          },
          {
            v0: { x: wallX, y: floorY, z: z1 },
            v1: { x: wallX, y: ceilY, z: z1 },
            v2: { x: wallX, y: ceilY, z: z0 },
            v3: { x: wallX, y: floorY, z: z0 },
            baseColor: color || "#1C1842",
            emissiveColor: gridColor || "#00F6FF",
            wireframe: r % 2 === 0,
            checker: true,
          },
          {
            v0: { x: -wallX, y: ceilY, z: z0 },
            v1: { x: wallX, y: ceilY, z: z0 },
            v2: { x: wallX, y: ceilY, z: z1 },
            v3: { x: -wallX, y: ceilY, z: z1 },
            baseColor: color || "#1C1842",
            emissiveColor: gridColor || "#00F6FF",
            wireframe: true,
          }
        );
      }
    }
  }

  drawCharacter3D(
    x = 0,
    y = -0.7,
    z = 2.6,
    animPhase = 0,
    style = "runner",
    primaryColor = "#FF1B24",
    accentColor = "#00E5FF"
  ): void {
    this.used3D = true;
    const px = Number(x) || 0;
    const py = Number(y) || -0.7;
    const pz = Number(z) || 2.6;
    const phase = Number(animPhase) || 0;
    const swing = Math.sin(phase * 6.28318);
    const bounce = Math.abs(Math.cos(phase * 6.28318)) * 0.18;
    const lean = style === "katana" ? 0.28 : 0.18;

    // Ombre portée au sol sous le personnage
    this.faces.push({
      v0: { x: px - 0.55, y: -1.56, z: pz - 0.55 },
      v1: { x: px + 0.55, y: -1.56, z: pz - 0.55 },
      v2: { x: px + 0.55, y: -1.56, z: pz + 0.55 },
      v3: { x: px - 0.55, y: -1.56, z: pz + 0.55 },
      baseColor: "#040508",
      emissiveColor: "#000000",
      wireframe: false,
    });

    // Torse articulé
    this.drawBox3D(
      px,
      py + 0.55 + bounce,
      pz,
      0.52,
      0.68,
      0.32,
      lean,
      swing * 0.14,
      0,
      primaryColor,
      accentColor,
      true
    );

    // Tête / Visière cyber PS2
    this.drawBox3D(
      px,
      py + 1.08 + bounce,
      pz + 0.06,
      0.38,
      0.36,
      0.38,
      0.08,
      -swing * 0.1,
      0,
      accentColor,
      "#FFFFFF",
      true
    );

    // Bras gauche & Bras droit
    this.drawBox3D(
      px - 0.38,
      py + 0.52 + bounce,
      pz - swing * 0.22,
      0.18,
      0.56,
      0.2,
      -swing * 0.75,
      0,
      0.1,
      primaryColor,
      accentColor,
      false
    );
    this.drawBox3D(
      px + 0.38,
      py + 0.52 + bounce,
      pz + swing * 0.22,
      0.18,
      0.56,
      0.2,
      swing * 0.75,
      0,
      -0.1,
      primaryColor,
      accentColor,
      false
    );

    // Si style "katana" ou "cyborg", ajouter une lame néon 3D dans la main droite
    if (style === "katana" || style === "cyborg" || style === "samurai") {
      this.drawBox3D(
        px + 0.52,
        py + 0.65 + bounce,
        pz + 0.45 + swing * 0.2,
        0.06,
        0.08,
        1.15,
        swing * 0.35 - 0.2,
        0.15,
        0,
        "#FFFFFF",
        accentColor,
        true
      );
    }

    // Jambe gauche & Jambe droite articulées
    this.drawBox3D(
      px - 0.16,
      py - 0.05 + bounce * 0.5,
      pz + swing * 0.28,
      0.21,
      0.62,
      0.22,
      swing * 0.85,
      0,
      0,
      "#181B24",
      accentColor,
      true
    );
    this.drawBox3D(
      px + 0.16,
      py - 0.05 + bounce * 0.5,
      pz - swing * 0.28,
      0.21,
      0.62,
      0.22,
      -swing * 0.85,
      0,
      0,
      "#181B24",
      accentColor,
      true
    );
  }

  drawParticles3D(
    count = 36,
    spread = 10,
    speed = 2.0,
    color = "#00E5FF",
    size = 2.0
  ): void {
    this.used3D = true;
    this.particles.push({
      count: clamp(Math.round(Number(count) || 36), 1, 140),
      spread: clamp(Number(spread) || 10, 1, 40),
      speed: Number(speed) || 2.0,
      color: color || "#00E5FF",
      size: clamp(Number(size) || 2, 1, 6),
    });
  }

  renderToCanvas(
    canvasCtx: CanvasRenderingContext2D,
    width: number,
    height: number,
    telemetry: {
      t: number;
      bass: number;
      mid: number;
      treble: number;
      flux: number;
      strobe: number;
      cameraZoom: number;
      pendulumSwing: number;
    }
  ): void {
    if (!this.used3D) return;

    // 1. Calculer la matrice caméra (LookAt + balancement pendulaire & zoom faders live)
    const swayX =
      Math.sin(telemetry.t * 0.9) * 0.65 * clamp(telemetry.pendulumSwing, 0, 1);
    const eye: Vec3D = {
      x: this.camPos.x + swayX,
      y: this.camPos.y,
      z: this.camPos.z,
    };
    const target = this.camTarget;

    let fx = target.x - eye.x;
    let fy = target.y - eye.y;
    let fz = target.z - eye.z;
    const fLen = Math.hypot(fx, fy, fz) || 1;
    fx /= fLen;
    fy /= fLen;
    fz /= fLen;

    // Right = Forward x Up(0,1,0) -> en repère caméra X droite, Y haut, Z profondeur avant
    let rx = fz;
    let ry = 0;
    let rz = -fx;
    const rLen = Math.hypot(rx, ry, rz) || 1;
    rx /= rLen;
    ry /= rLen;
    rz /= rLen;

    // Up = Right x Forward
    const ux = ry * fz - rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy - ry * fx;

    const fovRad = (this.camFov * Math.PI) / 180;
    const zoomMul = clamp(telemetry.cameraZoom || 1, 0.5, 2.4) * (1 + telemetry.bass * 0.1);
    const focal =
      (Math.min(width, height) * 0.55 * zoomMul) /
      Math.max(0.25, Math.tan(fovRad * 0.5));
    const cx = width * 0.5;
    const cy = height * 0.5;

    // 2. Fond atmosphérique 3D (dégradé brouillard + flash strobe aigu sur clap)
    const flash =
      telemetry.strobe > 0.02
        ? clamp((Math.max(telemetry.treble, telemetry.flux) - 0.2) * 1.6 * telemetry.strobe, 0, 0.75)
        : 0;
    const [fr, fg, fb] = parseColorRgb(this.fogColor);
    const skyTop = rgbToHex(
      fr * 0.45 + flash * 180,
      fg * 0.45 + flash * 180,
      fb * 0.52 + flash * 195
    );
    const horizonHex = rgbToHex(
      fr + flash * 140,
      fg + flash * 140,
      fb + flash * 150
    );
    const groundBot = rgbToHex(fr * 0.22, fg * 0.22, fb * 0.26);

    canvasCtx.save();
    const skyGrad = canvasCtx.createLinearGradient(0, 0, 0, cy);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(1, horizonHex);
    canvasCtx.fillStyle = skyGrad;
    canvasCtx.fillRect(0, 0, width, cy);

    const groundGrad = canvasCtx.createLinearGradient(0, cy, 0, height);
    groundGrad.addColorStop(0, horizonHex);
    groundGrad.addColorStop(0.45, groundBot);
    groundGrad.addColorStop(1, "#05060A");
    canvasCtx.fillStyle = groundGrad;
    canvasCtx.fillRect(0, cy, width, height - cy);

    // Horizon tramé Bayer PS1/PS2
    canvasCtx.fillStyle = this.fogColor;
    for (let y = Math.max(0, Math.floor(cy - 18)); y < Math.min(height, Math.floor(cy + 18)); y += 2) {
      for (let x = 0; x < width; x += 4) {
        if (BAYER_4X4[(y >> 1) & 3][(x >> 1) & 3] < 7) {
          canvasCtx.fillRect(x, y, 2, 1);
        }
      }
    }

    const projectWorld = (
      p: Vec3D
    ): { sx: number; sy: number; cz: number } | null => {
      const dx = p.x - eye.x;
      const dy = p.y - eye.y;
      const dz = p.z - eye.z;
      const camX = dx * rx + dy * ry + dz * rz;
      const camY = dx * ux + dy * uy + dz * uz;
      const camZ = dx * fx + dy * fy + dz * fz;
      if (camZ <= 0.35) return null;
      // Snapping léger des sommets (signature PS1/PS2 authentique)
      const sx = Math.round(cx + (camX * focal) / camZ);
      const sy = Math.round(cy - (camY * focal) / camZ);
      return { sx, sy, cz: camZ };
    };

    // 3. Projeter, éclairer (Lambert + Fog) et trier les faces en Z (Painter's algorithm)
    interface ProjectedPoly {
      pts: { sx: number; sy: number; cz: number }[];
      avgZ: number;
      fillHex: string;
      strokeHex: string;
      wireframe: boolean;
      checker: boolean;
    }

    const projectedList: ProjectedPoly[] = [];

    for (let i = 0; i < this.faces.length; i++) {
      const f = this.faces[i];
      const p0 = projectWorld(f.v0);
      const p1 = projectWorld(f.v1);
      const p2 = projectWorld(f.v2);
      const p3 = f.v3 ? projectWorld(f.v3) : null;
      if (!p0 || !p1 || !p2 || (f.v3 && !p3)) continue;

      const pts = p3 ? [p0, p1, p2, p3] : [p0, p1, p2];
      const avgZ =
        pts.reduce((acc, pt) => acc + pt.cz, 0) / pts.length;
      if (avgZ > this.fogFar * 1.45) continue;

      // Normale 3D de la face
      const ux1 = f.v1.x - f.v0.x,
        uy1 = f.v1.y - f.v0.y,
        uz1 = f.v1.z - f.v0.z;
      const ux2 = f.v2.x - f.v0.x,
        uy2 = f.v2.y - f.v0.y,
        uz2 = f.v2.z - f.v0.z;
      let nx = uy1 * uz2 - uz1 * uy2;
      let ny = uz1 * ux2 - ux1 * uz2;
      let nz = ux1 * uy2 - uy1 * ux2;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      nx /= nLen;
      ny /= nLen;
      nz /= nLen;

      const ndotl = Math.abs(
        nx * this.dirLightDir.x +
          ny * this.dirLightDir.y +
          nz * this.dirLightDir.z
      );
      const fogFactor = clamp(
        (avgZ - this.fogNear) / Math.max(1, this.fogFar - this.fogNear),
        0,
        0.92
      );

      const baseToneHex = f.checker
        ? shadeColorWithLightAndFog(
            f.baseColor,
            f.emissiveColor,
            this.ambientColor,
            this.ambientIntensity * 1.2,
            this.dirLightColor,
            this.dirLightIntensity,
            ndotl,
            this.fogColor,
            fogFactor
          )
        : shadeColorWithLightAndFog(
            f.baseColor,
            f.emissiveColor,
            this.ambientColor,
            this.ambientIntensity,
            this.dirLightColor,
            this.dirLightIntensity,
            ndotl,
            this.fogColor,
            fogFactor
          );

      projectedList.push({
        pts,
        avgZ,
        fillHex: baseToneHex,
        strokeHex: f.emissiveColor || "#00E5FF",
        wireframe: f.wireframe,
        checker: Boolean(f.checker),
      });
    }

    projectedList.sort((a, b) => b.avgZ - a.avgZ);

    // 4. Dessiner les polygones 3D pleins + arêtes émissives
    for (let i = 0; i < projectedList.length; i++) {
      const poly = projectedList[i];
      canvasCtx.beginPath();
      canvasCtx.moveTo(poly.pts[0].sx, poly.pts[0].sy);
      for (let k = 1; k < poly.pts.length; k++) {
        canvasCtx.lineTo(poly.pts[k].sx, poly.pts[k].sy);
      }
      canvasCtx.closePath();
      canvasCtx.fillStyle = poly.fillHex;
      canvasCtx.fill();

      if (poly.wireframe) {
        canvasCtx.strokeStyle = poly.strokeHex;
        canvasCtx.lineWidth = poly.avgZ < 7 ? 1.35 : 0.9;
        canvasCtx.stroke();
      }
    }

    // 5. Dessiner les particules 3D en profondeur
    for (const cmd of this.particles) {
      canvasCtx.fillStyle = cmd.color;
      for (let i = 0; i < cmd.count; i++) {
        const seedA = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
        const fracA = seedA - Math.floor(seedA);
        const seedB = Math.cos(i * 45.164 + 19.13) * 19432.21;
        const fracB = seedB - Math.floor(seedB);
        const seedC = Math.sin(i * 93.71 + 4.19) * 31741.8;
        const fracC = seedC - Math.floor(seedC);

        const px = (fracA - 0.5) * cmd.spread * 2;
        const py = -1.2 + fracB * (cmd.spread * 0.65);
        const rawZ =
          ((fracC * cmd.spread * 1.8 - telemetry.t * cmd.speed) %
            (cmd.spread * 1.8) +
            cmd.spread * 1.8) %
            (cmd.spread * 1.8) -
          1.5;

        const proj = projectWorld({ x: px, y: py, z: rawZ });
        if (!proj) continue;
        const sz = Math.max(
          1,
          Math.round((cmd.size * 5) / Math.max(1.5, proj.cz))
        );
        canvasCtx.fillRect(proj.sx, proj.sy, sz, sz);
      }
    }

    canvasCtx.restore();
  }
}

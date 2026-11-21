/**
 * Patcher binaire léger pour fichiers WebM (Matroska / EBML) produits par MediaRecorder.
 *
 * Problème connu des navigateurs (Chrome / Edge / Firefox / Brave) :
 * `MediaRecorder` écrit les flux WebM en mode streaming sans renseigner l'élément
 * EBML `Duration` (ID `0x4489`) dans la section `Info` (`0x1549A966`).
 * Conséquence : les lecteurs vidéo (VLC, QuickTime, Windows Media Player, lecteur HTML5)
 * affichent une durée `00:00` ou `∞` et désactivent la barre de navigation temporelle (seek).
 *
 * Cette fonction inspecte l'en-tête EBML du Blob WebM et injecte l'élément `Duration`
 * (Float64 big-endian en millisecondes, à l'échelle `TimecodeScale` par défaut 1 000 000 ns)
 * dans la section `Info` (`0x1549A966`), puis recalcule la taille du segment `Info`
 * pour rendre la vidéo immédiatement navigable ("seekable").
 */

function readVint(
  bytes: Uint8Array,
  offset: number,
  stripMarker = true
): { value: number; length: number } | null {
  if (offset >= bytes.length) return null;
  const first = bytes[offset];
  if (first === 0) return null;
  let mask = 0x80;
  let length = 1;
  while (length <= 8 && (first & mask) === 0) {
    mask >>= 1;
    length++;
  }
  if (length > 8 || offset + length > bytes.length) return null;

  let value = stripMarker ? first & (mask - 1) : first;
  for (let i = 1; i < length; i++) {
    value = value * 256 + bytes[offset + i];
  }
  return { value, length };
}

function encodeSizeVint8(size: number): Uint8Array {
  const out = new Uint8Array(8);
  let rem = size;
  for (let i = 7; i >= 1; i--) {
    out[i] = rem & 0xff;
    rem = Math.floor(rem / 256);
  }
  out[0] = 0x01 | (rem & 0x00);
  return out;
}

function writeFloat64BE(val: number): Uint8Array {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setFloat64(0, val, false);
  return new Uint8Array(buf);
}

/**
 * Corrige les métadonnées de durée d'un Blob vidéo (`video/webm` ou `video/mp4`)
 * généré par `MediaRecorder` pour permettre le déplacement dans le temps (seek).
 */
export async function fixRecordedVideoSeekable(
  blob: Blob,
  durationMs: number
): Promise<Blob> {
  if (
    !blob ||
    blob.size < 64 ||
    !Number.isFinite(durationMs) ||
    durationMs <= 0
  ) {
    return blob;
  }

  try {
    const ab = await blob.arrayBuffer();
    const bytes = new Uint8Array(ab);

    // Vérifier la signature EBML (0x1A 0x45 0xDF 0xA3) -> WebM / Matroska
    const isEbml =
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3;
    if (!isEbml) {
      return blob;
    }

    // Chercher l'élément Segment Info (ID: 0x15 0x49 0xA9 0x66) dans les 4096 premiers octets
    const searchLimit = Math.min(bytes.length - 16, 4096);
    let infoOffset = -1;
    for (let i = 0; i < searchLimit; i++) {
      if (
        bytes[i] === 0x15 &&
        bytes[i + 1] === 0x49 &&
        bytes[i + 2] === 0xa9 &&
        bytes[i + 3] === 0x66
      ) {
        infoOffset = i;
        break;
      }
    }
    if (infoOffset === -1) {
      return blob;
    }

    const sizeVint = readVint(bytes, infoOffset + 4, true);
    if (!sizeVint || sizeVint.value <= 0 || sizeVint.value > 4096) {
      return blob;
    }

    const infoDataStart = infoOffset + 4 + sizeVint.length;
    const infoDataEnd = infoDataStart + sizeVint.value;
    if (infoDataEnd > bytes.length) {
      return blob;
    }

    // Parcourir les sous-éléments de Info pour voir si Duration (0x44 0x89) existe déjà
    let cursor = infoDataStart;
    while (cursor < infoDataEnd) {
      const idVint = readVint(bytes, cursor, false);
      if (!idVint) break;
      const elSize = readVint(bytes, cursor + idVint.length, true);
      if (!elSize) break;
      const elDataStart = cursor + idVint.length + elSize.length;

      if (idVint.value === 0x4489) {
        // Duration existe déjà : la remplacer sur place (Float32 ou Float64)
        const copy = new Uint8Array(bytes);
        const view = new DataView(copy.buffer);
        if (elSize.value === 4 && elDataStart + 4 <= copy.length) {
          view.setFloat32(elDataStart, durationMs, false);
          return new Blob([copy], { type: blob.type });
        }
        if (elSize.value === 8 && elDataStart + 8 <= copy.length) {
          view.setFloat64(elDataStart, durationMs, false);
          return new Blob([copy], { type: blob.type });
        }
        break;
      }
      cursor = elDataStart + elSize.value;
    }

    // Construire l'élément Duration : ID (0x44 0x89) + Size (0x88 = 8 octets) + Float64(durationMs)
    const durationElement = new Uint8Array(11);
    durationElement[0] = 0x44;
    durationElement[1] = 0x89;
    durationElement[2] = 0x88;
    durationElement.set(writeFloat64BE(durationMs), 3);

    const newInfoDataSize = sizeVint.value + durationElement.length;
    const newInfoSizeBytes = encodeSizeVint8(newInfoDataSize);

    // Assembler le nouveau fichier WebM avec Info mis à jour et Duration injectée
    const prefix = bytes.subarray(0, infoOffset + 4);
    const oldInfoBody = bytes.subarray(infoDataStart, infoDataEnd);
    const suffix = bytes.subarray(infoDataEnd);

    const totalLen =
      prefix.length +
      newInfoSizeBytes.length +
      oldInfoBody.length +
      durationElement.length +
      suffix.length;

    const patched = new Uint8Array(totalLen);
    let pos = 0;
    patched.set(prefix, pos);
    pos += prefix.length;
    patched.set(newInfoSizeBytes, pos);
    pos += newInfoSizeBytes.length;
    patched.set(oldInfoBody, pos);
    pos += oldInfoBody.length;
    patched.set(durationElement, pos);
    pos += durationElement.length;
    patched.set(suffix, pos);

    return new Blob([patched], { type: blob.type });
  } catch {
    return blob;
  }
}

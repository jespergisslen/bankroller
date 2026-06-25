import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Load the OG fonts from disk instead of fetching Google Fonts at request time.
// The network fetch made cold-start OG generation slow enough that Twitter's
// crawler could time out and cache a blank card. Bundled fonts = fast + reliable.
async function readFont(file: string): Promise<ArrayBuffer> {
  const buf = await readFile(join(process.cwd(), "public/fonts", file));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export async function loadOgFonts() {
  const [grotesk700, grotesk500, mono600] = await Promise.all([
    readFont("SpaceGrotesk-Bold.ttf"),
    readFont("SpaceGrotesk-Medium.ttf"),
    readFont("IBMPlexMono-SemiBold.ttf"),
  ]);
  return [
    { name: "Grotesk", data: grotesk700, weight: 700 as const, style: "normal" as const },
    { name: "Grotesk", data: grotesk500, weight: 500 as const, style: "normal" as const },
    { name: "Mono", data: mono600, weight: 600 as const, style: "normal" as const },
  ];
}

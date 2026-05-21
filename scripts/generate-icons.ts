import sharp from "sharp";
import path from "node:path";

const BG = "#0f172a";
const FG = "#f8fafc";

async function makeIcon(size: number, outPath: string) {
  const fontSize = Math.round(size * 0.58);
  const cy = Math.round(size * 0.5 + fontSize * 0.34);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="${BG}" rx="${Math.round(size * 0.18)}" ry="${Math.round(size * 0.18)}"/>
      <text
        x="50%"
        y="${cy}"
        text-anchor="middle"
        font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-weight="700"
        font-size="${fontSize}"
        fill="${FG}"
      >S</text>
    </svg>
  `;
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`wrote ${outPath}`);
}

async function main() {
  const publicDir = path.join(process.cwd(), "public");
  await makeIcon(192, path.join(publicDir, "icon-192.png"));
  await makeIcon(512, path.join(publicDir, "icon-512.png"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

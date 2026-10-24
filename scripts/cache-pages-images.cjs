// Cache the artwork used by GitHub Pages so visitors do not depend on Steam's CDN.
const fs = require('node:fs');
const path = require('node:path');

const dist = path.join(__dirname, '..', 'dist');
const catalogPath = path.join(dist, 'catalog.json');
const artDir = path.join(dist, 'assets', 'game-media');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const featured = {
  1621690: [
    'https://mb.cision.com/Public/16500/3594296/af22e4eaa580b55c_org.jpg',
    'https://images.igdb.com/igdb/image/upload/t_720p/scagox.png',
    'https://images.igdb.com/igdb/image/upload/t_720p/scagoz.png',
    'https://images.igdb.com/igdb/image/upload/t_720p/scagp1.png'
  ],
  504230: [
    'https://img.itch.zone/aW1nLzEwMjQyNTgucG5n/original/kDcm5O.png',
    'https://img.itch.zone/aW1nLzEwMjQyNzAucG5n/original/9q4HnH.png',
    'https://img.itch.zone/aW1nLzEwMjQyNzIucG5n/original/cKNZVV.png'
  ],
  553420: [
    'https://finji.co/assets/images/tunic/TUNIC_KeyArt_1920x1080.png',
    'https://finji.co/assets/images/tunic/tunic1.png',
    'https://finji.co/assets/images/tunic/tunic2.png',
    'https://finji.co/assets/images/tunic/tunic3.png'
  ]
};
const featuredCredit = {
  1621690: ['Pugstorm / Cision', 'https://news.cision.com/enad-global-7-ab--publ-/i/core-keeper-key-art,c3066526'],
  504230: ['Maddy Makes Games / itch.io', 'https://maddymakesgamesinc.itch.io/celeste'],
  553420: ['TUNIC Team / Finji', 'https://finji.co/games/tunic/']
};
const jobs = [];
let bytesWritten = 0;
let cached = 0;
let skipped = 0;
fs.mkdirSync(artDir, { recursive: true });

async function save(url, filename) {
  if (!/^https:\/\//.test(url || '')) return null;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'IndieverseEditorialMediaCache/1.0', Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8' }
    });
    const mime = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[mime];
    if (!response.ok || !ext) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 5000 || buffer.length > 4500000 || bytesWritten + buffer.length > 450000000) return null;
    const file = `${filename}.${ext}`;
    fs.writeFileSync(path.join(artDir, file), buffer);
    bytesWritten += buffer.length;
    cached++;
    return `/assets/game-media/${file}`;
  } catch { return null; }
}

for (const game of catalog.games) {
  const gallery = featured[game.app] || game.images?.slice(0, 3).map(image => image.src) || [];
  gallery.slice(0, 4).forEach((src, index) => jobs.push(async () => {
    const local = await save(src, `${game.app}-scene-${index + 1}`);
    if (!local) { skipped++; return; }
    if (game.images?.[index]) {
      game.images[index].src = local;
      if (featured[game.app]) {
        game.images[index].kind = index === 0 ? 'Hình quảng bá chính thức' : 'Hình minh họa chính thức';
        game.images[index].credit = featuredCredit[game.app][0];
        game.images[index].sourceUrl = featuredCredit[game.app][1];
      }
    }
    if (game.steamMedia?.screenshots?.[index]) game.steamMedia.screenshots[index] = local;
    if (index === 0) game.localHeroImage = local;
  }));
  const cover = game.coverImage && !/steamstatic/.test(game.coverImage)
    ? game.coverImage
    : `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.app}/library_600x900.jpg`;
  jobs.push(async () => {
    const local = await save(cover, `${game.app}-cover`);
    if (local) game.localCoverImage = local;
    else skipped++;
  });
}

(async () => {
  let next = 0;
  await Promise.all(Array.from({ length: 16 }, async () => {
    while (next < jobs.length) await jobs[next++]();
  }));
  fs.writeFileSync(catalogPath, JSON.stringify(catalog));
  console.log(`Game art cache: ${cached} images, ${skipped} unavailable, ${(bytesWritten / 1e6).toFixed(1)} MB`);
  if (cached < 3) throw new Error('Game art cache could not download the verified featured images.');
})().catch(error => { console.error(error); process.exitCode = 1; });


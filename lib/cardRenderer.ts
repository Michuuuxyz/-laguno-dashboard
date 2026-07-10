import { createCanvas, loadImage, GlobalFonts, type Image, type SKRSContext2D } from '@napi-rs/canvas';
import type { WelcomeCardTemplate } from './welcomeCard';

export interface WCContext { avatarUrl: string; displayName: string; username: string; memberCount: number; serverName: string; id?: string; tag?: string; serverIconUrl?: string | null }

let fontsReady = false;
async function ensureFonts(base: string): Promise<void> {
  if (fontsReady) return;
  fontsReady = true;
  const load = async (file: string, name: string) => {
    try {
      const res = await fetch(`${base}/fonts/${file}`);
      if (res.ok) GlobalFonts.register(Buffer.from(await res.arrayBuffer()), name);
    } catch { /* usa fallback do sistema */ }
  };
  await Promise.all([
    load('Poppins-Bold.ttf', 'Poppins Bold'),
    load('Poppins-SemiBold.ttf', 'Poppins SemiBold'),
    load('Poppins-Regular.ttf', 'Poppins'),
  ]);
}

// SSRF: o URL vem da config — nunca buscar a endereços internos/privados.
function isSafeImageUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h === '::1' || h.startsWith('[') || h.endsWith('.local') || h.endsWith('.internal')) return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
      const [a, b] = h.split('.').map(Number);
      if (a === 127 || a === 10 || a === 0 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254)) return false;
    }
    return true;
  } catch { return false; }
}

async function fetchImage(url: string): Promise<Image | null> {
  try {
    if (!isSafeImageUrl(url)) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await loadImage(Buffer.from(await res.arrayBuffer()));
  } catch { return null; }
}

function subst(s: string, c: WCContext): string {
  return (s || '')
    .replace(/{user}/g, c.displayName).replace(/{username}/g, c.username)
    .replace(/{count}/g, String(c.memberCount)).replace(/{server}/g, c.serverName)
    .replace(/{@user}/g, `@${c.displayName}`)
    .replace(/{user\.name}/g, c.username)
    .replace(/{user\.id}/g, c.id ?? '')
    .replace(/{user\.tag}/g, c.tag ?? c.username)
    .replace(/{user\.discriminator}/g, '0')
    .replace(/{guild\.name}/g, c.serverName)
    .replace(/{guild\.size}/g, String(c.memberCount))
    .replace(/{guild}/g, c.serverName);
}

function drawCover(g: SKRSContext2D, img: Image, W: number, H: number): void {
  const r = Math.max(W / img.width, H / img.height);
  const w = img.width * r, h = img.height * r;
  g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

/** Mesmo motor do bot — usado no dashboard para o botão "Testar cartão". */
export async function renderWelcomeCard(t: WelcomeCardTemplate, c: WCContext, fontBase: string): Promise<Buffer> {
  await ensureFonts(fontBase);
  const W = Math.min(Math.max(Math.round(t.width) || 1024, 200), 2048);
  const H = Math.min(Math.max(Math.round(t.height) || 400, 100), 1024);
  const canvas = createCanvas(W, H);
  const g = canvas.getContext('2d');

  if (t.bgType === 'gradient') {
    const grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, t.bgColor || '#0d0d0f');
    grad.addColorStop(1, t.bgColor2 || t.bgColor || '#1a1a1e');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
  } else {
    g.fillStyle = t.bgColor || '#1a1a1e'; g.fillRect(0, 0, W, H);
    if (t.bgType === 'image' && t.bgUrl) { const bg = await fetchImage(t.bgUrl); if (bg) drawCover(g, bg, W, H); }
  }
  const ov = Math.max(0, Math.min(1, t.bgOverlay ?? 0));
  if (ov > 0) { g.fillStyle = `rgba(0,0,0,${ov})`; g.fillRect(0, 0, W, H); }

  for (const layer of t.layers || []) {
    if (layer.type === 'shape') {
      g.save();
      g.globalAlpha = Math.max(0, Math.min(1, layer.opacity ?? 1));
      g.fillStyle = layer.fill || '#000000';
      g.beginPath();
      if (layer.kind === 'circle') g.ellipse(layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2);
      else g.roundRect(layer.x, layer.y, layer.width, layer.height, Math.max(0, Math.min(layer.radius ?? 0, Math.min(layer.width, layer.height) / 2)));
      g.fill();
      if (layer.strokeWidth && layer.strokeWidth > 0) { g.strokeStyle = layer.strokeColor || '#ffffff'; g.lineWidth = layer.strokeWidth; g.stroke(); }
      g.restore();
      continue;
    }
    if (layer.type === 'avatar') {
      const src = layer.source === 'server' ? c.serverIconUrl : c.avatarUrl;
      if (!src) continue;
      const img = await fetchImage(src);
      if (!img) continue;
      const { x, y, size } = layer;
      g.save();
      g.globalAlpha = Math.max(0, Math.min(1, layer.opacity ?? 1));
      g.save();
      if (layer.shape !== 'square') { g.beginPath(); g.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); g.closePath(); g.clip(); }
      g.drawImage(img, x, y, size, size);
      g.restore();
      if (layer.borderWidth && layer.borderWidth > 0) {
        g.strokeStyle = layer.borderColor || '#ffffff'; g.lineWidth = layer.borderWidth; g.beginPath();
        if (layer.shape !== 'square') g.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); else g.rect(x, y, size, size);
        g.stroke();
      }
      g.restore();
    } else {
      const txt = subst(layer.text, c);
      g.save();
      g.globalAlpha = Math.max(0, Math.min(1, layer.opacity ?? 1));
      if (layer.shadow) { g.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.55)'; g.shadowBlur = layer.shadowBlur ?? 6; g.shadowOffsetX = 0; g.shadowOffsetY = Math.round((layer.shadowBlur ?? 6) / 3); }
      g.fillStyle = layer.color || '#ffffff';
      g.font = `${Math.max(8, layer.size)}px "${layer.font || 'Poppins Bold'}"`;
      g.textBaseline = 'top';
      g.textAlign = layer.align || 'center';
      const ax = layer.align === 'center' ? layer.x + layer.width / 2 : layer.align === 'right' ? layer.x + layer.width : layer.x;
      g.fillText(txt, ax, layer.y, layer.width || W);
      g.restore();
    }
  }
  return canvas.toBuffer('image/png');
}

// Tipos do template do cartão de boas-vindas + template por defeito.
// SEM dependências de Konva/browser — pode ser importado em qualquer lado
// (o editor com Konva é carregado à parte via next/dynamic ssr:false).

export interface WCText   { id: string; type: 'text'; x: number; y: number; width: number; text: string; size: number; color: string; font: string; align: 'left' | 'center' | 'right'; opacity?: number; shadow?: boolean; shadowColor?: string; shadowBlur?: number }
export interface WCAvatar { id: string; type: 'avatar'; x: number; y: number; size: number; shape: 'circle' | 'square'; borderColor?: string; borderWidth?: number; opacity?: number; source?: 'member' | 'server' }
export interface WCShape  { id: string; type: 'shape'; kind: 'rect' | 'circle'; x: number; y: number; width: number; height: number; fill: string; opacity: number; radius?: number; strokeColor?: string; strokeWidth?: number }
export type WCLayer = WCText | WCAvatar | WCShape;
export interface WelcomeCardTemplate {
  width: number; height: number;
  bgType: 'color' | 'gradient' | 'image';
  bgColor?: string; bgColor2?: string; bgUrl?: string; bgOverlay?: number;
  layers: WCLayer[];
}

export const CARD_W = 1024;
export const CARD_H = 400;

const sid = () => Math.random().toString(36).slice(2, 8);

export function defaultCard(): WelcomeCardTemplate {
  return {
    width: CARD_W, height: CARD_H, bgType: 'color', bgColor: '#0d0d0f',
    layers: [
      { id: sid(), type: 'avatar', x: 412, y: 54, size: 200, shape: 'circle', borderColor: '#6db83e', borderWidth: 8 },
      { id: sid(), type: 'text', x: 0, y: 280, width: 1024, text: 'Bem-vindo, {user}!', size: 56, color: '#ffffff', font: 'Poppins Bold', align: 'center' },
      { id: sid(), type: 'text', x: 0, y: 348, width: 1024, text: 'Membro nº {count} · {server}', size: 26, color: '#8f8f9d', font: 'Poppins', align: 'center' },
    ],
  };
}

/* ── Modelos prontos — um clique e o cartão está montado; personalizar é opcional ── */
export const CARD_TEMPLATES: { id: string; name: string; desc: string; make: () => WelcomeCardTemplate }[] = [
  {
    id: 'classico', name: 'Clássico', desc: 'Avatar à esquerda, texto ao lado e o ícone do servidor no canto.',
    make: () => ({
      width: 1024, height: 300, bgType: 'color', bgColor: '#0b0b0d',
      layers: [
        { id: sid(), type: 'avatar', x: 42, y: 46, size: 208, shape: 'circle', borderColor: '#ffffff', borderWidth: 8 },
        { id: sid(), type: 'avatar', x: 918, y: 26, size: 64, shape: 'circle', borderColor: '#ffffff', borderWidth: 3, source: 'server' },
        { id: sid(), type: 'text', x: 296, y: 88, width: 600, text: 'Bem-vindo/a {username}!', size: 48, color: '#ffffff', font: 'Poppins Bold', align: 'left' },
        { id: sid(), type: 'text', x: 298, y: 158, width: 600, text: 'Tu és o membro #{count}!', size: 30, color: '#b5bac1', font: 'Poppins', align: 'left' },
      ],
    }),
  },
  {
    id: 'centrado', name: 'Centrado', desc: 'Avatar ao centro com o texto por baixo.',
    make: defaultCard,
  },
  {
    id: 'faixa', name: 'Faixa', desc: 'Banner fino com gradiente — discreto e elegante.',
    make: () => ({
      width: 1024, height: 260, bgType: 'gradient', bgColor: '#0d0d0f', bgColor2: '#12300f',
      layers: [
        { id: sid(), type: 'avatar', x: 58, y: 40, size: 180, shape: 'circle', borderColor: '#6db83e', borderWidth: 6 },
        { id: sid(), type: 'text', x: 280, y: 82, width: 690, text: '{username} chegou a {server}', size: 42, color: '#ffffff', font: 'Poppins Bold', align: 'left', shadow: true, shadowBlur: 8 },
        { id: sid(), type: 'text', x: 282, y: 146, width: 690, text: 'Membro nº {count}', size: 24, color: '#a9e08a', font: 'Poppins', align: 'left' },
      ],
    }),
  },
  {
    id: 'painel', name: 'Painel', desc: 'Texto sobre um painel translúcido — ideal com imagem de fundo.',
    make: () => ({
      width: 1024, height: 400, bgType: 'color', bgColor: '#0d0d0f', bgOverlay: 0,
      layers: [
        { id: sid(), type: 'shape', kind: 'rect', x: 132, y: 248, width: 760, height: 122, fill: '#6db83e', opacity: 0.13, radius: 24, strokeColor: '#6db83e', strokeWidth: 2 },
        { id: sid(), type: 'avatar', x: 412, y: 32, size: 190, shape: 'circle', borderColor: '#6db83e', borderWidth: 7 },
        { id: sid(), type: 'text', x: 0, y: 266, width: 1024, text: 'Bem-vindo, {user}!', size: 50, color: '#ffffff', font: 'Poppins Bold', align: 'center', shadow: true, shadowBlur: 8 },
        { id: sid(), type: 'text', x: 0, y: 328, width: 1024, text: 'Membro nº {count} · {server}', size: 24, color: '#a9e08a', font: 'Poppins', align: 'center' },
      ],
    }),
  },
];

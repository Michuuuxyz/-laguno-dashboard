// Tipos do template do cartão de boas-vindas + template por defeito.
// SEM dependências de Konva/browser — pode ser importado em qualquer lado
// (o editor com Konva é carregado à parte via next/dynamic ssr:false).

export interface WCText   { id: string; type: 'text'; x: number; y: number; width: number; text: string; size: number; color: string; font: string; align: 'left' | 'center' | 'right' }
export interface WCAvatar { id: string; type: 'avatar'; x: number; y: number; size: number; shape: 'circle' | 'square'; borderColor?: string; borderWidth?: number }
export interface WCShape  { id: string; type: 'shape'; kind: 'rect' | 'circle'; x: number; y: number; width: number; height: number; fill: string; opacity: number; radius?: number; strokeColor?: string; strokeWidth?: number }
export type WCLayer = WCText | WCAvatar | WCShape;
export interface WelcomeCardTemplate {
  width: number; height: number;
  bgType: 'color' | 'image'; bgColor?: string; bgUrl?: string;
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

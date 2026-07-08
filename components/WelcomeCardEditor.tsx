'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Ellipse, Image as KImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import { CARD_W, CARD_H, type WCLayer, type WelcomeCardTemplate } from '@/lib/welcomeCard';

const CANVAS_W = CARD_W;
const CANVAS_H = CARD_H;
const SAMPLE_AVATAR = '/laguno.png';

const FONTS = [
  { v: 'Poppins Bold', l: 'Poppins Bold', w: '700' },
  { v: 'Poppins SemiBold', l: 'Poppins SemiBold', w: '600' },
  { v: 'Poppins', l: 'Poppins Regular', w: '400' },
];
const fontWeight = (f: string) => FONTS.find(x => x.v === f)?.w ?? '700';

const sid = () => Math.random().toString(36).slice(2, 8);

/* Substitui as variáveis por um exemplo, para o preview */
function sample(s: string) {
  return (s || '').replace(/{user}/g, 'Michu').replace(/{username}/g, 'michu').replace(/{count}/g, '1234').replace(/{server}/g, 'Laguno');
}

function useHtmlImage(src?: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) { setImg(null); return; }
    const i = new window.Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => setImg(i);
    i.onerror = () => setImg(null);
    i.src = src;
    return () => { i.onload = null; i.onerror = null; };
  }, [src]);
  return img;
}

const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5, display: 'block' };
const inp: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13, width: '100%', outline: 'none' };

export function WelcomeCardEditor({ card, onChange }: { card: WelcomeCardTemplate; onChange: (c: WelcomeCardTemplate) => void }) {
  const [selId, setSelId] = useState<string | null>(null);
  const [display, setDisplay] = useState(680);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const scale = display / CANVAS_W;
  const bgImg = useHtmlImage(card.bgType === 'image' ? card.bgUrl : undefined);
  const avatarImg = useHtmlImage(SAMPLE_AVATAR);

  // Carrega a Poppins no browser (fidelidade do preview com o render do bot)
  useEffect(() => {
    const id = 'poppins-font-editor';
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    document.head.appendChild(l);
  }, []);

  // Largura responsiva do palco
  useEffect(() => {
    const upd = () => { if (wrapRef.current) setDisplay(Math.min(wrapRef.current.clientWidth, 820)); };
    upd();
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);

  // Liga o transformer ao nó selecionado
  useEffect(() => {
    const tr = trRef.current; const stage = stageRef.current;
    if (!tr || !stage) return;
    if (!selId) { tr.nodes([]); tr.getLayer()?.batchDraw(); return; }
    const node = stage.findOne('#' + selId);
    if (node) { tr.nodes([node]); tr.getLayer()?.batchDraw(); }
    else tr.nodes([]);
  }, [selId, card.layers]);

  const patch = (id: string, v: Partial<WCLayer>) =>
    onChange({ ...card, layers: card.layers.map(l => l.id === id ? { ...l, ...v } as WCLayer : l) });
  const setBg = (v: Partial<WelcomeCardTemplate>) => onChange({ ...card, ...v });
  const remove = (id: string) => { onChange({ ...card, layers: card.layers.filter(l => l.id !== id) }); setSelId(null); };
  const addText = () => { const id = sid(); onChange({ ...card, layers: [...card.layers, { id, type: 'text', x: 262, y: 170, width: 500, text: 'Novo texto', size: 40, color: '#ffffff', font: 'Poppins Bold', align: 'center' }] }); setSelId(id); };
  const addAvatar = () => { const id = sid(); onChange({ ...card, layers: [...card.layers, { id, type: 'avatar', x: 100, y: 100, size: 160, shape: 'circle', borderColor: '#6db83e', borderWidth: 6 }] }); setSelId(id); };
  // Formas entram no FUNDO da pilha (atrás do texto/avatar) — servem de painel.
  const addShape = () => { const id = sid(); onChange({ ...card, layers: [{ id, type: 'shape', kind: 'rect', x: 160, y: 130, width: 704, height: 150, fill: '#000000', opacity: 0.4, radius: 24, strokeColor: '#6db83e', strokeWidth: 0 }, ...card.layers] }); setSelId(id); };

  const sel = card.layers.find(l => l.id === selId) ?? null;

  const boundsOf = (l: WCLayer) => l.type === 'text' ? { w: l.width, h: l.size } : l.type === 'avatar' ? { w: l.size, h: l.size } : { w: l.width, h: l.height };
  const align = (dir: 'h' | 'v' | 'left' | 'right' | 'top' | 'bottom') => {
    if (!sel) return;
    const { w, h } = boundsOf(sel);
    const v: Partial<WCLayer> = {};
    if (dir === 'h') v.x = Math.round((CANVAS_W - w) / 2);
    else if (dir === 'left') v.x = 0;
    else if (dir === 'right') v.x = CANVAS_W - w;
    else if (dir === 'v') v.y = Math.round((CANVAS_H - h) / 2);
    else if (dir === 'top') v.y = 0;
    else if (dir === 'bottom') v.y = CANVAS_H - h;
    patch(sel.id, v);
  };
  const duplicate = () => {
    if (!sel) return;
    const id = sid();
    const copy = { ...sel, id, x: sel.x + 24, y: sel.y + 24 } as WCLayer;
    const idx = card.layers.findIndex(l => l.id === sel.id);
    const next = [...card.layers]; next.splice(idx + 1, 0, copy);
    onChange({ ...card, layers: next }); setSelId(id);
  };
  const order = (to: 'front' | 'back') => {
    if (!sel) return;
    const rest = card.layers.filter(l => l.id !== sel.id);
    onChange({ ...card, layers: to === 'front' ? [...rest, sel] : [sel, ...rest] });
  };
  const tbBtn: React.CSSProperties = { flex: 1, padding: '5px 4px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text-2)' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 16, alignItems: 'start' }} className="wc-grid">
      {/* ── Palco ── */}
      <div ref={wrapRef} style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <button onClick={addText} style={{ ...inp, width: 'auto', cursor: 'pointer', fontWeight: 600, color: 'var(--green)' }}>+ Texto</button>
          <button onClick={addAvatar} style={{ ...inp, width: 'auto', cursor: 'pointer', fontWeight: 600, color: 'var(--green)' }}>+ Avatar</button>
          <button onClick={addShape} style={{ ...inp, width: 'auto', cursor: 'pointer', fontWeight: 600, color: 'var(--green)' }}>+ Forma</button>
          <span style={{ fontSize: 11.5, color: 'var(--text-3)', alignSelf: 'center' }}>Arrasta os elementos. Clica num para editar à direita.</span>
        </div>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', width: display, maxWidth: '100%' }}>
          <Stage ref={stageRef} width={display} height={CANVAS_H * scale} scaleX={scale} scaleY={scale}
            onMouseDown={e => { if (e.target === e.target.getStage()) setSelId(null); }}>
            <Layer>
              <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={card.bgColor || '#0d0d0f'} />
              {card.bgType === 'image' && bgImg && (() => {
                const r = Math.max(CANVAS_W / bgImg.width, CANVAS_H / bgImg.height);
                const w = bgImg.width * r, h = bgImg.height * r;
                return <KImage image={bgImg} x={(CANVAS_W - w) / 2} y={(CANVAS_H - h) / 2} width={w} height={h} listening={false} />;
              })()}

              {card.layers.map(l => {
                if (l.type === 'shape') {
                  const common = {
                    id: l.id, draggable: true,
                    fill: l.fill, opacity: l.opacity,
                    stroke: l.strokeWidth ? l.strokeColor : undefined, strokeWidth: l.strokeWidth || 0,
                    onClick: () => setSelId(l.id), onTap: () => setSelId(l.id),
                  };
                  if (l.kind === 'circle') {
                    return <Ellipse key={l.id} {...common} x={l.x + l.width / 2} y={l.y + l.height / 2} radiusX={l.width / 2} radiusY={l.height / 2}
                      onDragEnd={(e) => patch(l.id, { x: Math.round(e.target.x() - l.width / 2), y: Math.round(e.target.y() - l.height / 2) })}
                      onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(), sy = n.scaleY(); n.scaleX(1); n.scaleY(1); const w = Math.max(10, Math.round(l.width * sx)), h = Math.max(10, Math.round(l.height * sy)); patch(l.id, { width: w, height: h, x: Math.round(n.x() - w / 2), y: Math.round(n.y() - h / 2) }); }} />;
                  }
                  return <Rect key={l.id} {...common} x={l.x} y={l.y} width={l.width} height={l.height} cornerRadius={l.radius || 0}
                    onDragEnd={(e) => patch(l.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) })}
                    onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(), sy = n.scaleY(); n.scaleX(1); n.scaleY(1); patch(l.id, { x: Math.round(n.x()), y: Math.round(n.y()), width: Math.max(10, Math.round(l.width * sx)), height: Math.max(10, Math.round(l.height * sy)) }); }} />;
                }
                if (l.type === 'avatar') {
                  const common = {
                    id: l.id, draggable: true, opacity: l.opacity ?? 1,
                    onClick: () => setSelId(l.id), onTap: () => setSelId(l.id),
                    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => patch(l.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) }),
                    stroke: l.borderColor, strokeWidth: l.borderWidth || 0,
                  };
                  if (l.shape === 'square') {
                    return <Rect key={l.id} {...common} x={l.x} y={l.y} width={l.size} height={l.size}
                      fillPatternImage={avatarImg ?? undefined}
                      fillPatternScaleX={avatarImg ? l.size / avatarImg.width : 1}
                      fillPatternScaleY={avatarImg ? l.size / avatarImg.height : 1}
                      onTransformEnd={(e) => { const n = e.target; const s = n.scaleX(); n.scaleX(1); n.scaleY(1); patch(l.id, { x: Math.round(n.x()), y: Math.round(n.y()), size: Math.round(l.size * s) }); }} />;
                  }
                  return <Circle key={l.id} {...common} x={l.x + l.size / 2} y={l.y + l.size / 2} radius={l.size / 2}
                    fillPatternImage={avatarImg ?? undefined}
                    fillPatternScaleX={avatarImg ? l.size / avatarImg.width : 1}
                    fillPatternScaleY={avatarImg ? l.size / avatarImg.height : 1}
                    fillPatternOffsetX={avatarImg ? avatarImg.width / 2 : 0}
                    fillPatternOffsetY={avatarImg ? avatarImg.height / 2 : 0}
                    onDragEnd={(e) => patch(l.id, { x: Math.round(e.target.x() - l.size / 2), y: Math.round(e.target.y() - l.size / 2) })}
                    onTransformEnd={(e) => { const n = e.target; const s = n.scaleX(); n.scaleX(1); n.scaleY(1); const ns = Math.round(l.size * s); patch(l.id, { size: ns, x: Math.round(n.x() - ns / 2), y: Math.round(n.y() - ns / 2) }); }} />;
                }
                return <Text key={l.id} id={l.id} draggable x={l.x} y={l.y} width={l.width} text={sample(l.text)}
                  fontSize={l.size} fill={l.color} align={l.align} fontFamily="Poppins" fontStyle={fontWeight(l.font)}
                  opacity={l.opacity ?? 1}
                  shadowEnabled={!!l.shadow} shadowColor={l.shadowColor || 'rgba(0,0,0,0.55)'} shadowBlur={l.shadowBlur ?? 6} shadowOffsetY={Math.round((l.shadowBlur ?? 6) / 3)}
                  onClick={() => setSelId(l.id)} onTap={() => setSelId(l.id)}
                  onDragEnd={(e) => patch(l.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) })}
                  onTransformEnd={(e) => { const n = e.target as Konva.Text; const s = n.scaleX(); n.scaleX(1); n.scaleY(1); patch(l.id, { x: Math.round(n.x()), y: Math.round(n.y()), width: Math.round(l.width * s), size: Math.round(l.size * s) }); }} />;
              })}

              <Transformer ref={trRef} rotateEnabled={false} borderStroke="#6db83e" anchorStroke="#6db83e" anchorFill="#0d0d0f"
                enabledAnchors={sel?.type === 'shape' ? undefined : ['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                boundBoxFunc={(oldB, newB) => newB.width < 20 ? oldB : newB} />
            </Layer>
          </Stage>
        </div>
        {/* Variáveis */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {['{user}', '{username}', '{count}', '{server}'].map(v => (
            <code key={v} style={{ fontSize: 11, background: 'var(--elevated)', border: '1px solid var(--line)', borderRadius: 5, padding: '2px 6px', color: 'var(--text-2)' }}>{v}</code>
          ))}
        </div>
      </div>

      {/* ── Painel de propriedades ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Fundo */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 12 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>Fundo</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {(['color', 'image'] as const).map(t => (
              <button key={t} onClick={() => setBg({ bgType: t })} style={{ flex: 1, padding: '6px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: `1px solid ${card.bgType === t ? 'var(--green)' : 'var(--line)'}`, background: card.bgType === t ? 'rgba(109,184,62,.1)' : 'var(--surface)', color: card.bgType === t ? 'var(--green)' : 'var(--text-2)' }}>{t === 'color' ? 'Cor' : 'Imagem'}</button>
            ))}
          </div>
          {card.bgType === 'color'
            ? <div style={{ display: 'flex', gap: 6 }}><input type="color" value={card.bgColor || '#0d0d0f'} onChange={e => setBg({ bgColor: e.target.value })} style={{ width: 36, height: 32, borderRadius: 6, border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }} /><input style={inp} value={card.bgColor || ''} onChange={e => setBg({ bgColor: e.target.value })} /></div>
            : <input style={inp} value={card.bgUrl || ''} onChange={e => setBg({ bgUrl: e.target.value })} placeholder="https://…/fundo.png" />}
        </div>

        {/* Elemento selecionado */}
        {sel ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12.5, fontWeight: 700 }}>{sel.type === 'text' ? 'Texto' : sel.type === 'avatar' ? 'Avatar' : 'Forma'}</p>
              <button onClick={() => remove(sel.id)} style={{ fontSize: 11.5, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>Remover</button>
            </div>

            {/* Alinhar / camadas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => align('h')} style={{ ...tbBtn, fontWeight: 600, color: 'var(--green)', borderColor: 'rgba(109,184,62,.3)' }}>Centrar na horizontal</button>
                <button onClick={() => align('v')} style={{ ...tbBtn, fontWeight: 600, color: 'var(--green)', borderColor: 'rgba(109,184,62,.3)' }}>Centrar na vertical</button>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => align('left')} style={tbBtn}>Esq</button>
                <button onClick={() => align('right')} style={tbBtn}>Dir</button>
                <button onClick={() => align('top')} style={tbBtn}>Topo</button>
                <button onClick={() => align('bottom')} style={tbBtn}>Baixo</button>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={duplicate} style={tbBtn}>Duplicar</button>
                <button onClick={() => order('front')} style={tbBtn}>Trazer à frente</button>
                <button onClick={() => order('back')} style={tbBtn}>Enviar p/ trás</button>
              </div>
            </div>

            {sel.type === 'text' && <>
              <div><label style={lbl}>Conteúdo</label><input style={inp} value={sel.text} onChange={e => patch(sel.id, { text: e.target.value })} /></div>
              <div><label style={lbl}>Fonte</label><select style={inp} value={sel.font} onChange={e => patch(sel.id, { font: e.target.value })}>{FONTS.map(f => <option key={f.v} value={f.v}>{f.l}</option>)}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                <div><label style={lbl}>Tamanho ({sel.size})</label><input type="range" min={12} max={140} value={sel.size} onChange={e => patch(sel.id, { size: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                <div><label style={lbl}>Cor</label><input type="color" value={sel.color} onChange={e => patch(sel.id, { color: e.target.value })} style={{ width: 36, height: 32, borderRadius: 6, border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }} /></div>
              </div>
              <div><label style={lbl}>Alinhamento do texto</label><div style={{ display: 'flex', gap: 4 }}>{(['left', 'center', 'right'] as const).map(a => <button key={a} onClick={() => patch(sel.id, { align: a })} style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 11.5, cursor: 'pointer', border: `1px solid ${sel.align === a ? 'var(--green)' : 'var(--line)'}`, background: sel.align === a ? 'rgba(109,184,62,.1)' : 'var(--surface)', color: sel.align === a ? 'var(--green)' : 'var(--text-2)' }}>{a === 'left' ? 'Esq' : a === 'center' ? 'Centro' : 'Dir'}</button>)}</div></div>
              <div><label style={lbl}>Transparência ({Math.round((sel.opacity ?? 1) * 100)}%)</label><input type="range" min={0} max={100} value={Math.round((sel.opacity ?? 1) * 100)} onChange={e => patch(sel.id, { opacity: parseInt(e.target.value) / 100 })} style={{ width: '100%' }} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!sel.shadow} onChange={e => patch(sel.id, { shadow: e.target.checked })} /> Sombra (ajuda a ler sobre imagens)
              </label>
              {sel.shadow && <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                <div><label style={lbl}>Desfoque ({sel.shadowBlur ?? 6})</label><input type="range" min={0} max={30} value={sel.shadowBlur ?? 6} onChange={e => patch(sel.id, { shadowBlur: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                <div><label style={lbl}>Cor</label><input type="color" value={sel.shadowColor?.startsWith('#') ? sel.shadowColor : '#000000'} onChange={e => patch(sel.id, { shadowColor: e.target.value })} style={{ width: 36, height: 32, borderRadius: 6, border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }} /></div>
              </div>}
            </>}
            {sel.type === 'avatar' && <>
              <div><label style={lbl}>Forma</label><div style={{ display: 'flex', gap: 4 }}>{(['circle', 'square'] as const).map(s => <button key={s} onClick={() => patch(sel.id, { shape: s })} style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 11.5, cursor: 'pointer', border: `1px solid ${sel.shape === s ? 'var(--green)' : 'var(--line)'}`, background: sel.shape === s ? 'rgba(109,184,62,.1)' : 'var(--surface)', color: sel.shape === s ? 'var(--green)' : 'var(--text-2)' }}>{s === 'circle' ? 'Círculo' : 'Quadrado'}</button>)}</div></div>
              <div><label style={lbl}>Tamanho ({sel.size})</label><input type="range" min={40} max={340} value={sel.size} onChange={e => patch(sel.id, { size: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                <div><label style={lbl}>Borda ({sel.borderWidth || 0})</label><input type="range" min={0} max={20} value={sel.borderWidth || 0} onChange={e => patch(sel.id, { borderWidth: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                <div><label style={lbl}>Cor</label><input type="color" value={sel.borderColor || '#6db83e'} onChange={e => patch(sel.id, { borderColor: e.target.value })} style={{ width: 36, height: 32, borderRadius: 6, border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }} /></div>
              </div>
              <div><label style={lbl}>Transparência ({Math.round((sel.opacity ?? 1) * 100)}%)</label><input type="range" min={0} max={100} value={Math.round((sel.opacity ?? 1) * 100)} onChange={e => patch(sel.id, { opacity: parseInt(e.target.value) / 100 })} style={{ width: '100%' }} /></div>
            </>}
            {sel.type === 'shape' && <>
              <div><label style={lbl}>Tipo</label><div style={{ display: 'flex', gap: 4 }}>{(['rect', 'circle'] as const).map(k => <button key={k} onClick={() => patch(sel.id, { kind: k })} style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 11.5, cursor: 'pointer', border: `1px solid ${sel.kind === k ? 'var(--green)' : 'var(--line)'}`, background: sel.kind === k ? 'rgba(109,184,62,.1)' : 'var(--surface)', color: sel.kind === k ? 'var(--green)' : 'var(--text-2)' }}>{k === 'rect' ? 'Retângulo' : 'Círculo'}</button>)}</div></div>
              <div><label style={lbl}>Cor de preenchimento</label><div style={{ display: 'flex', gap: 6 }}><input type="color" value={sel.fill} onChange={e => patch(sel.id, { fill: e.target.value })} style={{ width: 36, height: 32, borderRadius: 6, border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }} /><input style={inp} value={sel.fill} onChange={e => patch(sel.id, { fill: e.target.value })} /></div></div>
              <div><label style={lbl}>Transparência ({Math.round(sel.opacity * 100)}%)</label><input type="range" min={0} max={100} value={Math.round(sel.opacity * 100)} onChange={e => patch(sel.id, { opacity: parseInt(e.target.value) / 100 })} style={{ width: '100%' }} /></div>
              {sel.kind === 'rect' && <div><label style={lbl}>Cantos redondos ({sel.radius || 0})</label><input type="range" min={0} max={80} value={sel.radius || 0} onChange={e => patch(sel.id, { radius: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                <div><label style={lbl}>Contorno ({sel.strokeWidth || 0})</label><input type="range" min={0} max={16} value={sel.strokeWidth || 0} onChange={e => patch(sel.id, { strokeWidth: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                <div><label style={lbl}>Cor</label><input type="color" value={sel.strokeColor || '#6db83e'} onChange={e => patch(sel.id, { strokeColor: e.target.value })} style={{ width: 36, height: 32, borderRadius: 6, border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }} /></div>
              </div>
            </>}
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px dashed var(--line)', borderRadius: 10, padding: '18px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
            Clica num elemento na tela para o editares.
          </div>
        )}
      </div>

      <style>{`@media (max-width: 760px){ .wc-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

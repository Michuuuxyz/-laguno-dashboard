'use client';

import { useEffect, useRef, useState } from 'react';
import { AppBadge } from './AppBadge';
import { input, lbl } from './ui';

interface Loaded {
  globalName: string; globalAvatar: string;
  nick: string; guildAvatar: string | null; guildBanner: string | null;
}

const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px' };

// undefined = não mexer · null = limpar · string = nova imagem (data URI)
type ImgState = string | null | undefined;

export function BotProfileTab({ guildId }: { guildId: string }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [nick, setNick] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<ImgState>(undefined);
  const [banner, setBanner] = useState<ImgState>(undefined);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/guilds/${guildId}/bot-profile`).then(r => r.ok ? r.json() : null).catch(() => null).then((d: Loaded | null) => {
      if (d) { setLoaded(d); setNick(d.nick ?? ''); }
    });
  }, [guildId]);

  const flash = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 5000); };

  function pickImage(kind: 'avatar' | 'banner', file: File | undefined) {
    if (!file) return;
    if (file.size > 6_000_000) { flash('Imagem demasiado grande (máx 6 MB).', false); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const uri = reader.result as string;
      if (kind === 'avatar') setAvatar(uri); else setBanner(uri);
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    const body: Record<string, unknown> = { nick, bio };
    if (avatar !== undefined) body.avatar = avatar;
    if (banner !== undefined) body.banner = banner;
    const res = await fetch(`/api/guilds/${guildId}/bot-profile`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }).catch(() => null);
    setSaving(false);
    const data = await res?.json().catch(() => ({}));
    if (res && res.ok) { flash('Guardado! Pode demorar uns segundos a aparecer no Discord.', true); setAvatar(undefined); setBanner(undefined); }
    else flash(data?.error ?? 'Não foi possível guardar.', false);
  }

  if (!loaded) return <div className="skel" style={{ height: 220, borderRadius: 12 }} />;

  // Valores efetivos para o preview (3 estados: null = limpar → usa global,
  // string = nova imagem, undefined = não mexido → mostra o atual do servidor)
  const previewName = nick.trim() || loaded.globalName;
  const previewAvatar = avatar === null ? loaded.globalAvatar : (avatar ?? loaded.guildAvatar ?? loaded.globalAvatar);
  const previewBanner = banner === null ? null : (banner ?? loaded.guildBanner);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 18, alignItems: 'start' }} className="bp-grid">

      {/* ── Editor ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>Nome do bot neste servidor</label>
            <input style={input} value={nick} onChange={e => setNick(e.target.value)} maxLength={32} placeholder={loaded.globalName} />
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>Como o Laguno se chama só aqui. Em branco = nome global (<strong>{loaded.globalName}</strong>).</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px),1fr))', gap: 14 }}>
            {/* Avatar */}
            <div>
              <label style={lbl}>Foto (avatar)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                { }
                <img src={previewAvatar} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => avatarInput.current?.click()} style={{ ...input, width: 'auto', cursor: 'pointer', padding: '6px 12px', fontSize: 12.5 }}>Carregar…</button>
                  {(avatar || (avatar === undefined && loaded.guildAvatar)) && <button onClick={() => setAvatar(null)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 11.5, cursor: 'pointer', textAlign: 'left', padding: 0 }}>Remover (usar global)</button>}
                  {avatar === null && <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Vai usar o avatar global.</span>}
                </div>
                <input ref={avatarInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" style={{ display: 'none' }} onChange={e => pickImage('avatar', e.target.files?.[0])} />
              </div>
            </div>
            {/* Banner */}
            <div>
              <label style={lbl}>Banner</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => bannerInput.current?.click()} style={{ ...input, cursor: 'pointer', padding: '6px 12px', fontSize: 12.5, textAlign: 'center' }}>Carregar banner…</button>
                {(banner || (banner === undefined && loaded.guildBanner)) && <button onClick={() => setBanner(null)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 11.5, cursor: 'pointer', padding: 0 }}>Remover banner</button>}
                {banner === null && <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Banner removido.</span>}
                <input ref={bannerInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" style={{ display: 'none' }} onChange={e => pickImage('banner', e.target.files?.[0])} />
              </div>
            </div>
          </div>

          <div>
            <label style={lbl}>Bio <span style={{ opacity: .6, textTransform: 'none' }}>(sobre o bot, neste servidor)</span></label>
            <textarea rows={2} style={{ ...input, resize: 'vertical' }} value={bio} onChange={e => setBio(e.target.value)} maxLength={190} placeholder="Ex: O guardião deste servidor." />
          </div>
        </div>

        <div style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 10, padding: '11px 14px' }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
            <strong style={{ color: '#fbbf24' }}>Nota:</strong> nome, foto, banner e bio ficam <strong>só neste servidor</strong>. A <strong>atividade/status</strong> (ex: &quot;A ouvir /help&quot;) é global no Discord — não dá para ser diferente por servidor, por isso não está aqui.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', bottom: 0 }}>
          <button onClick={save} disabled={saving} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 24px', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
          {toast && <span style={{ fontSize: 12.5, color: toast.ok ? 'var(--green)' : '#f87171', lineHeight: 1.4 }}>{toast.msg}</span>}
        </div>
      </div>

      {/* ── Preview estilo Discord ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 90 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Lista de membros</p>
          <div style={{ background: '#2b2d31', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
            { }
            <img src={previewAvatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f2f3f5' }}>{previewName}</span>
            <AppBadge />
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Perfil</p>
          <div style={{ background: '#232428', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: 70, background: previewBanner ? `center/cover url(${previewBanner})` : 'linear-gradient(120deg,#5865f2,#8b5cf6)' }} />
            <div style={{ padding: '0 14px 14px', marginTop: -28 }}>
              { }
              <img src={previewAvatar} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '5px solid #232428' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#f2f3f5' }}>{previewName}</span>
                <AppBadge />
              </div>
              {bio.trim() && <p style={{ fontSize: 12.5, color: '#dbdee1', lineHeight: 1.5, marginTop: 8, whiteSpace: 'pre-wrap' }}>{bio}</p>}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 820px){ .bp-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

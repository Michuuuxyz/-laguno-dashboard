'use client';

import { useEffect, useState } from 'react';

const LINES = ['O teu', 'servidor', 'sem caos.'];

export function TypingHero() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [displayed, setDisplayed] = useState(['', '', '']);

  useEffect(() => {
    if (done) return;
    const line = LINES[lineIdx];
    const timeout = setTimeout(() => {
      const next = charIdx + 1;
      setDisplayed(prev => {
        const arr = [...prev];
        arr[lineIdx] = line.slice(0, next);
        return arr;
      });
      if (next >= line.length) {
        if (lineIdx + 1 >= LINES.length) {
          setDone(true);
        } else {
          setLineIdx(l => l + 1);
          setCharIdx(0);
        }
      } else {
        setCharIdx(next);
      }
    }, 60);
    return () => clearTimeout(timeout);
  }, [lineIdx, charIdx, done]);

  return (
    <h1 className="display" style={{
      fontSize: 'clamp(52px,10vw,130px)',
      fontWeight: 800,
      letterSpacing: '-.04em',
      lineHeight: 0.95,
      color: 'var(--text-1)',
      marginBottom: 0,
    }}>
      {LINES.map((line, i) => (
        <span key={i} style={{ display: 'block' }}>
          <span style={i === 2 ? { color: 'var(--green)' } : {}}>
            {displayed[i]}
          </span>
          {!done && i === lineIdx && (
            <span style={{ borderRight: '3px solid currentColor', marginLeft: 1, animation: 'blink .7s step-end infinite' }} />
          )}
        </span>
      ))}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </h1>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';

interface Props {
  children: string;
  speed?: number; // ms per character
  delay?: number; // ms before starting
  className?: string;
  style?: React.CSSProperties;
}

export function TypingAnimation({ children, speed = 38, delay = 300, className, style }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    setDone(false);

    const start = setTimeout(() => {
      const interval = setInterval(() => {
        idx.current++;
        setDisplayed(children.slice(0, idx.current));
        if (idx.current >= children.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(start);
  }, [children, speed, delay]);

  return (
    <span className={className} style={style}>
      {displayed}
      {!done && (
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '0.85em',
          background: 'var(--green)',
          marginLeft: '3px',
          verticalAlign: 'text-bottom',
          animation: 'cursor-blink .7s steps(1) infinite',
        }} />
      )}
    </span>
  );
}

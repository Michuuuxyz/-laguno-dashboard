'use client';

import React from 'react';

interface OrbitingCirclesProps {
  children?: React.ReactNode;
  radius?: number;
  iconSize?: number;
  duration?: number;
  reverse?: boolean;
  path?: boolean;
}

export function OrbitingCircles({
  children,
  radius = 160,
  iconSize = 30,
  duration = 20,
  reverse = false,
  path = true,
}: OrbitingCirclesProps) {
  const count = React.Children.count(children);
  const id = React.useId().replace(/:/g, '');

  return (
    <>
      <style>{`
        @keyframes orbit-${id} {
          from { transform: rotate(0deg) translateX(${radius}px) rotate(0deg); }
          to   { transform: rotate(${reverse ? '-' : ''}360deg) translateX(${radius}px) rotate(${reverse ? '' : '-'}360deg); }
        }
      `}</style>

      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <circle cx="50%" cy="50%" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </svg>
      )}

      {React.Children.map(children, (child, i) => {
        const delay = -(duration / count) * i;
        return (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: iconSize,
              height: iconSize,
              marginTop: -(iconSize / 2),
              marginLeft: -(iconSize / 2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `orbit-${id} ${duration}s linear ${delay}s infinite`,
              transformOrigin: '0 0',
            }}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}

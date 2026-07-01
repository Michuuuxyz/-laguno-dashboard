'use client';

import React from 'react';

interface OrbitingCirclesProps {
  children?: React.ReactNode;
  radius?: number;
  iconSize?: number;
  path?: boolean;
}

export function OrbitingCircles({
  children,
  radius = 160,
  iconSize = 30,
  path = true,
}: OrbitingCirclesProps) {
  const count = React.Children.count(children);

  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <circle cx="50%" cy="50%" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </svg>
      )}

      {React.Children.map(children, (child, i) => {
        const angle = (360 / count) * i - 90;
        const rad   = (angle * Math.PI) / 180;
        const x     = Math.cos(rad) * radius;
        const y     = Math.sin(rad) * radius;
        return (
          <div
            style={{
              position: 'absolute',
              top:  `calc(50% + ${y}px)`,
              left: `calc(50% + ${x}px)`,
              width: iconSize,
              height: iconSize,
              marginTop:  -(iconSize / 2),
              marginLeft: -(iconSize / 2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}

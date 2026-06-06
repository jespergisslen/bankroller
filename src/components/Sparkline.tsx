"use client";

import { useEffect, useRef } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  fill?: boolean;
  animate?: boolean;
  strokeWidth?: number;
}

export function Sparkline({ data, width = 600, height = 196, fill = true, animate = true, strokeWidth = 2 }: SparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 8) - 4,
  }));

  const linePath = points.reduce((d, p, i) =>
    i === 0 ? `M${p.x},${p.y}` : `${d} L${p.x},${p.y}`, "");

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  const last = points[points.length - 1];

  useEffect(() => {
    if (!animate || !pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${len}`;
    pathRef.current.style.strokeDashoffset = `${len}`;
    pathRef.current.style.animation = "drawLine 1.3s cubic-bezier(.2,.7,.2,1) forwards";
  }, [animate, data]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
      overflow="visible"
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <filter id="glowFilter">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <style>{`
          @keyframes drawLine {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </defs>
      {fill && <path d={areaPath} fill="url(#sparkGrad)" />}
      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#glowFilter)"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={3.5}
        fill="var(--accent)"
        filter="url(#glowFilter)"
      />
    </svg>
  );
}

export function MiniSpark({ data, width = 120, height = 32 }: { data: number[]; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const d = points.reduce((p, pt, i) => i === 0 ? `M${pt.x},${pt.y}` : `${p} L${pt.x},${pt.y}`, "");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width, height }}>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

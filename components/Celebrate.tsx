"use client";

import { useEffect, useRef } from "react";

// Lightweight confetti + petals celebration, drawn on a canvas. No external
// library (works offline). Renders a full-screen overlay with a message, then
// calls onClose. Used for rank promotions.
export default function Celebrate({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const colors = ["#27ae9f", "#1f8b7f", "#1f2a44", "#3a4a6b", "#f4c95d", "#e88aa0", "#ffffff"];

    type Bit = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; color: string; shape: number };
    const bits: Bit[] = [];
    const N = 160;
    for (let i = 0; i < N; i++) {
      bits.push({
        x: W() / 2 + (Math.random() - 0.5) * 80,
        y: H() * 0.35 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 11,
        vy: Math.random() * -11 - 4,
        r: 4 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.floor(Math.random() * 3), // 0 rect, 1 circle, 2 petal
      });
    }

    let raf = 0;
    let t = 0;
    function frame() {
      t += 1;
      ctx.clearRect(0, 0, W(), H());
      for (const b of bits) {
        b.vy += 0.22;        // gravity
        b.vx *= 0.995;
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillStyle = b.color;
        if (b.shape === 0) {
          ctx.fillRect(-b.r / 2, -b.r / 2, b.r, b.r * 1.6);
        } else if (b.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, b.r * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // simple 5-petal flower
          for (let p = 0; p < 5; p++) {
            ctx.beginPath();
            ctx.ellipse(0, -b.r, b.r * 0.5, b.r, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.rotate((Math.PI * 2) / 5);
          }
        }
        ctx.restore();
      }
      if (t < 220) raf = requestAnimationFrame(frame);
    }
    frame();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{ background: "rgba(31,42,68,0.72)" }}
      onClick={onClose}
    >
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" />
      <div className="relative z-10 text-center animate-in" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow !text-teal">Rank up</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">{title}</h2>
        {subtitle && <p className="text-white/85 mt-3 max-w-xs mx-auto">{subtitle}</p>}
        <button onClick={onClose} className="btn-primary mt-7">Keep training</button>
      </div>
    </div>
  );
}

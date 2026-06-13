'use client';

import { useEffect, useRef, useState } from 'react';

interface LanyardSuccessModalProps {
  participantName: string;
  paymentId: string;
  onClose: () => void;
}

export default function LanyardSuccessModal({ participantName, paymentId, onClose }: LanyardSuccessModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const W = 380, H = 500;
    cv.width = W;
    cv.height = H;

    const ANCHOR_X = W / 2;
    const ARM_LEN = 220;
    const BADGE_W = 160;
    const BADGE_H = 200;
    const CLIP_H = 40;
    const STRAP_W = 18;

    let angle = 0;
    let angVel = -0.1;
    const GRAVITY = 0.0016;
    const DAMPING = 0.988;

    let dropY = -BADGE_H - CLIP_H - 80;
    let dropVY = 0;
    let dropPhase = true;
    const finalDrop = 0;
    let detailsShown = false;

    function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.arcTo(x + w, y, x + w, y + r, r);
      c.lineTo(x + w, y + h - r);
      c.arcTo(x + w, y + h, x + w - r, y + h, r);
      c.lineTo(x + r, y + h);
      c.arcTo(x, y + h, x, y + h - r, r);
      c.lineTo(x, y + r);
      c.arcTo(x, y, x + r, y, r);
      c.closePath();
    }

    function drawBg() {
      if (!ctx) return;
      // Transparent background so we can see through
      ctx.clearRect(0, 0, W, H);
    }

    function drawStrap(fromY: number, toY: number) {
      if (!ctx) return;
      const hw = STRAP_W / 2;
      const grad = ctx.createLinearGradient(-hw, 0, hw, 0);
      grad.addColorStop(0, '#0d0d0d');
      grad.addColorStop(0.25, '#222');
      grad.addColorStop(0.5, '#333');
      grad.addColorStop(0.75, '#1a1a1a');
      grad.addColorStop(1, '#080808');
      ctx.fillStyle = grad;
      ctx.fillRect(-hw, fromY, STRAP_W, toY - fromY);
      // highlight stripe
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(-hw + 3, fromY, 2.5, toY - fromY);
      // weave texture
      for (let y = fromY + 8; y < toY - 10; y += 18) {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(-hw + 1, y, STRAP_W - 2, 2);
      }
    }

    function drawClip(atY: number) {
      if (!ctx) return;
      const clipW = STRAP_W + 10;
      const hw = clipW / 2;
      const ch = CLIP_H;

      // main body gradient — gold
      const bg = ctx.createLinearGradient(-hw, atY, hw, atY + ch);
      bg.addColorStop(0, '#7a6000');
      bg.addColorStop(0.2, '#c8a000');
      bg.addColorStop(0.4, '#f0c830');
      bg.addColorStop(0.5, '#ffe570');
      bg.addColorStop(0.65, '#e0b020');
      bg.addColorStop(0.85, '#a07800');
      bg.addColorStop(1, '#6a5200');
      ctx.fillStyle = bg;
      roundRect(ctx, -hw, atY, clipW, ch, 4);
      ctx.fill();

      // border
      ctx.strokeStyle = '#3a2c00';
      ctx.lineWidth = 0.8;
      roundRect(ctx, -hw, atY, clipW, ch, 4);
      ctx.stroke();

      // inner shine
      ctx.strokeStyle = 'rgba(255,245,120,0.45)';
      ctx.lineWidth = 1;
      roundRect(ctx, -hw + 1.5, atY + 1.5, clipW - 3, ch - 3, 3);
      ctx.stroke();

      // hole cutout
      const holeW = STRAP_W - 2;
      const holeH = ch * 0.42;
      ctx.fillStyle = '#0a0800';
      roundRect(ctx, -holeW / 2, atY + ch * 0.3, holeW, holeH, 2);
      ctx.fill();

      // diamond studs on both sides
      const dSize = 5.5;
      const dCount = 4;
      const dSpacing = ch / (dCount + 1);
      for (let i = 1; i <= dCount; i++) {
        const dy = atY + dSpacing * i;
        [-1, 1].forEach(side => {
          ctx.save();
          ctx.translate(side * (hw + 4), dy);
          ctx.rotate(Math.PI / 4);
          const dg = ctx.createLinearGradient(-dSize / 2, -dSize / 2, dSize / 2, dSize / 2);
          dg.addColorStop(0, '#fff5a0');
          dg.addColorStop(0.4, '#f0c020');
          dg.addColorStop(1, '#7a5a00');
          ctx.fillStyle = dg;
          ctx.fillRect(-dSize / 2, -dSize / 2, dSize, dSize);
          ctx.strokeStyle = 'rgba(80,60,0,0.7)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(-dSize / 2, -dSize / 2, dSize, dSize);
          ctx.restore();
        });
      }
    }

    function drawBadge(topY: number, name: string) {
      if (!ctx) return;
      const bx = -BADGE_W / 2;
      const by = topY;
      const bw = BADGE_W;
      const bh = BADGE_H;
      const br = 13;

      // shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 12;
      const badgeGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      badgeGrad.addColorStop(0, '#f7c800');
      badgeGrad.addColorStop(0.35, '#f0b500');
      badgeGrad.addColorStop(0.7, '#e8a600');
      badgeGrad.addColorStop(1, '#cc9000');
      ctx.fillStyle = badgeGrad;
      roundRect(ctx, bx, by, bw, bh, br);
      ctx.fill();
      ctx.restore();

      // top shine
      const shine = ctx.createLinearGradient(bx, by, bx, by + bh * 0.45);
      shine.addColorStop(0, 'rgba(255,255,200,0.28)');
      shine.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle = shine;
      roundRect(ctx, bx, by, bw, bh, br);
      ctx.fill();

      // border
      ctx.strokeStyle = 'rgba(160,110,0,0.5)';
      ctx.lineWidth = 1.2;
      roundRect(ctx, bx + 1, by + 1, bw - 2, bh - 2, br - 1);
      ctx.stroke();

      // lanyard hole + ring
      const hx = 0, hy = by + 18, hr = 7;
      const ringG = ctx.createLinearGradient(-12, hy - 12, 12, hy + 12);
      ringG.addColorStop(0, '#ffe566');
      ringG.addColorStop(0.5, '#b88000');
      ringG.addColorStop(1, '#6a4800');
      ctx.strokeStyle = ringG;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(hx, hy, hr + 1, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#08060e';
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();

      // DexLabs icon circle
      const iconCY = by + 80;
      const iconR = 22;
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.beginPath(); ctx.arc(0, iconCY, iconR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(240,180,0,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, iconCY, iconR, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#f0b800';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('D', 0, iconCY + 1);

      // DexLabs wordmark
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DexLabs', 0, iconCY + 34);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.font = '400 9px system-ui, sans-serif';
      ctx.fillText('AI Workshop 2026', 0, iconCY + 50);

      // divider line
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + 20, by + bh * 0.74);
      ctx.lineTo(bx + bw - 20, by + bh * 0.74);
      ctx.stroke();

      // participant name
      const displayName = name.length > 16 ? name.slice(0, 15) + '…' : name;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.font = `bold ${displayName.length > 12 ? 13 : 15}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayName.toUpperCase(), 0, by + bh * 0.83);

      // attendee label
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.font = '500 8px system-ui, sans-serif';
      ctx.fillText('ATTENDEE', 0, by + bh * 0.83 + 18);

      // barcode lines at bottom
      const barcodeY = by + bh - 20;
      const barcodeW = bw - 40;
      const barcodeX = bx + 20;
      for (let i = 0; i < 28; i++) {
        const barW = i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1;
        const barH = i % 4 === 0 ? 12 : 8;
        ctx.fillStyle = `rgba(0,0,0,${0.3 + (i % 3) * 0.1})`;
        ctx.fillRect(barcodeX + i * (barcodeW / 28), barcodeY - barH, barW, barH);
      }
    }

    function drawGroundShadow(ang: number) {
      if (!ctx) return;
      const shadowX = ANCHOR_X + Math.sin(ang) * ARM_LEN * 0.45;
      const stretch = 0.6 + Math.abs(Math.sin(ang)) * 0.3;
      ctx.save();
      ctx.translate(shadowX, H - 24);
      ctx.scale(stretch, 0.15);
      ctx.beginPath();
      ctx.arc(0, 0, BADGE_W / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      drawBg();

      if (dropPhase) {
        dropVY += 2.2;
        dropY += dropVY;
        if (dropY >= finalDrop) {
          dropY = finalDrop;
          dropPhase = false;
          angVel = -0.11;
        }
        // draw strap from anchor to clip
        ctx.save();
        ctx.translate(ANCHOR_X, 0);
        drawStrap(0, dropY + CLIP_H > 0 ? dropY + CLIP_H : 0);
        ctx.restore();
        // draw clip + badge at drop position
        ctx.save();
        ctx.translate(ANCHOR_X, dropY);
        drawClip(0);
        drawBadge(CLIP_H, participantName);
        ctx.restore();
      } else {
        const acc = -GRAVITY * Math.sin(angle);
        angVel += acc;
        angVel *= DAMPING;
        angle += angVel;

        if (Math.abs(angVel) < 0.0002 && Math.abs(angle) < 0.001) {
          angle = 0; angVel = 0;
          if (!detailsShown) { detailsShown = true; setShowDetails(true); }
        }

        drawGroundShadow(angle);

        ctx.save();
        ctx.translate(ANCHOR_X, 0);
        ctx.rotate(angle);
        drawStrap(0, ARM_LEN);
        drawClip(ARM_LEN - CLIP_H - 2);
        drawBadge(ARM_LEN, participantName);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [participantName]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-950/95 via-violet-950/95 to-black/95 backdrop-blur-sm">
      
      {/* Success Message Header */}
      <div className="absolute top-20 text-center animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center animate-bounce">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-2 animate-gradient-text bg-gradient-to-r from-green-400 via-blue-400 to-violet-400 bg-clip-text">
          Registration Successful!
        </h2>
        <p className="text-gray-300 text-lg">
          Welcome to the AI & Machine Learning Workshop
        </p>
      </div>

      {/* top pin point */}
      <div className="relative flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 shadow-xl mb-2 z-10 border-2 border-gray-400" />
        <div className="text-gray-400 text-xs mb-2">Your Digital Badge</div>
      </div>

      <canvas
        ref={canvasRef}
        className="block"
        style={{ touchAction: 'none' }}
      />

      {/* success details — fade in after lanyard settles */}
      <div
        className="text-center transition-all duration-700"
        style={{
          opacity: showDetails ? 1 : 0,
          transform: showDetails ? 'translateY(0)' : 'translateY(16px)',
          marginTop: '-20px'
        }}
      >
        <div className="bg-gradient-to-br from-violet-900/60 to-blue-900/60 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/30 shadow-2xl max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-green-400 text-2xl">✓</span>
            <p className="text-white font-bold text-xl">Payment Confirmed</p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="bg-black/30 rounded-lg p-3 border border-violet-500/20">
              <p className="text-gray-400 text-xs mb-1">Workshop Details</p>
              <p className="text-white text-sm font-medium">Check your email for Zoom link & materials</p>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
              <p className="text-gray-400 text-xs mb-1">Payment ID</p>
              <p className="text-green-400 text-xs font-mono">{paymentId}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-lg p-3 border border-blue-500/30">
              <p className="text-blue-300 text-sm font-medium">🎓 See you on June 14, 2026!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-8 py-3 rounded-xl text-base font-semibold text-white transition-all transform hover:scale-105 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              boxShadow: '0 0 24px rgba(139, 92, 246, 0.4)'
            }}
          >
            Continue to Workshop Page
          </button>
        </div>
      </div>
    </div>
  );
}

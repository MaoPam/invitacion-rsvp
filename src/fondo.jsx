import React, { useEffect, useRef } from 'react';

const NebulaBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, stars, particles, constellations;
    let animationFrameId;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      init();
    };

    const randBetween = (a, b) => a + Math.random() * (b - a);

    const STAR_COLORS = ['#ffffff','#E0AAFF','#C77DFF','#7B2FBE','#48CAE4','#FF9EF5','#FFD6FF','#FF2D78','#B5EAEA'];
    const PART_COLORS = ['#C850C0','#4158D0','#FF2D78','#00F5D4','#B99AFF','#FFD166'];

    const init = () => {
      stars = Array.from({length:180}, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: randBetween(.3, 2.2),
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        phase: Math.random() * Math.PI * 2, speed: randBetween(.3, 1.2), bright: randBetween(.4, 1)
      }));
      particles = Array.from({length:55}, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: randBetween(.8, 2.8),
        color: PART_COLORS[Math.floor(Math.random() * PART_COLORS.length)],
        vx: randBetween(-.18, .18), vy: randBetween(-.12, .12),
        alpha: randBetween(.2, .7), phase: Math.random() * Math.PI * 2, speed: randBetween(.4, 1.5)
      }));
      const pts = Array.from({length:22}, () => ({ x: randBetween(40, W - 40), y: randBetween(40, H - 40) }));
      constellations = [];
      for(let i = 0; i < pts.length; i++){
        for(let j = i + 1; j < pts.length; j++){
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if(d < W * 0.18 && constellations.length < 28)
            constellations.push({x1: pts[i].x, y1: pts[i].y, x2: pts[j].x, y2: pts[j].y});
        }
      }
    };

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      [
        {x: W * .15, y: H * .2, r: W * .35, c: 'rgba(65,88,208,.07)'},
        {x: W * .8, y: H * .15, r: W * .3, c: 'rgba(200,80,192,.06)'},
        {x: W * .5, y: H * .75, r: W * .4, c: 'rgba(124,58,255,.05)'},
        {x: W * .9, y: H * .7, r: W * .25, c: 'rgba(0,245,212,.04)'},
      ].forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });
      constellations.forEach(l => {
        ctx.save(); ctx.strokeStyle = 'rgba(180,150,255,0.12)'; ctx.lineWidth = .6; ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke(); ctx.restore();
      });
      stars.forEach(s => {
        const alpha = s.bright * (.5 + .5 * Math.sin(t * s.speed + s.phase));
        ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = s.color;
        ctx.shadowBlur = s.r > 1.5 ? 6 : 0; ctx.shadowColor = s.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if(s.r > 1.6){
          ctx.strokeStyle = s.color; ctx.lineWidth = .4; ctx.globalAlpha = alpha * .5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
        ctx.restore();
      });
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < -5) p.x = W + 5; if(p.x > W + 5) p.x = -5;
        if(p.y < -5) p.y = H + 5; if(p.y > H + 5) p.y = -5;
        const a = p.alpha * (.6 + .4 * Math.sin(t * p.speed + p.phase));
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.color;
        ctx.shadowBlur = 8; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      t += .018;
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="nebula" />;
};

export default NebulaBackground;
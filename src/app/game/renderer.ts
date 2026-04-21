import type { GameState } from './GameEngine';

const COLORS = {
  bg: '#0d1117',
  bgGrid: '#161b22',
  rig: '#4a9eff',
  rigDamaged: '#ff6b35',
  player: '#00ff88',
  playerDead: '#555',
  shambler: '#cc3333',
  brute: '#aa0000',
  hpBarBg: '#333',
  hpBarFill: '#00cc44',
  hpBarLow: '#cc4400',
  enemyHpFill: '#cc3333',
  scrapParticle: '#ffd700',
  arena: '#0a0f14',
};

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
  ctx.fillStyle = COLORS.arena;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = COLORS.bgGrid;
  ctx.lineWidth = 0.5;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  ctx.strokeStyle = '#1e2d3d';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  const rig = state.rig;
  const rigColor = rig.hp / rig.maxHp < 0.3 ? COLORS.rigDamaged : COLORS.rig;
  ctx.save();
  ctx.translate(rig.pos.x, rig.pos.y);
  const rigGrad = ctx.createRadialGradient(0, 0, rig.radius * 0.3, 0, 0, rig.radius * 1.5);
  rigGrad.addColorStop(0, rigColor + '44');
  rigGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = rigGrad;
  ctx.beginPath(); ctx.arc(0, 0, rig.radius * 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rig.isOverrun ? '#333' : rigColor;
  ctx.beginPath(); ctx.arc(0, 0, rig.radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000000aa';
  ctx.beginPath(); ctx.arc(0, 0, rig.radius * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RIG', 0, 0);
  ctx.restore();

  drawHpBar(ctx, rig.pos.x - 30, rig.pos.y + rig.radius + 6, 60, 5, rig.hp / rig.maxHp, COLORS.rig);

  for (const e of state.enemies) {
    if (e.isDead) continue;
    const isB = e.defId === 'brute';
    const color = isB ? COLORS.brute : COLORS.shambler;

    ctx.save();
    ctx.translate(e.pos.x, e.pos.y);

    ctx.fillStyle = color;
    ctx.beginPath();
    if (isB) {
      ctx.rect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
    } else {
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
    }
    ctx.fill();

    drawHpBar(ctx, -e.radius, e.radius + 3, e.radius * 2, 3, e.hp / e.maxHp, COLORS.enemyHpFill);

    ctx.restore();
  }

  const pl = state.player;
  ctx.save();
  ctx.translate(pl.pos.x, pl.pos.y);
  if (pl.isDead) {
    ctx.fillStyle = COLORS.playerDead;
  } else {
    const plGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, pl.radius * 2);
    plGrad.addColorStop(0, '#00ff8888');
    plGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = plGrad;
    ctx.beginPath(); ctx.arc(0, 0, pl.radius * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLORS.player;
  }
  ctx.beginPath();
  ctx.moveTo(0, -pl.radius);
  ctx.lineTo(pl.radius * 0.85, pl.radius * 0.7);
  ctx.lineTo(-pl.radius * 0.85, pl.radius * 0.7);
  ctx.closePath();
  ctx.fill();

  drawHpBar(ctx, -20, pl.radius + 4, 40, 4, pl.hp / pl.maxHp, COLORS.hpBarFill);

  ctx.restore();
}

function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pct: number, fillColor: string): void {
  ctx.fillStyle = COLORS.hpBarBg;
  ctx.fillRect(x, y, w, h);
  const barColor = pct < 0.25 ? COLORS.hpBarLow : fillColor;
  ctx.fillStyle = barColor;
  ctx.fillRect(x, y, w * Math.max(0, pct), h);
}

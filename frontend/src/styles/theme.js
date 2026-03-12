/**
 * CodeViz — Shared Premium Theme Tokens
 * 
 * Import these tokens into any page/component to use
 * consistent premium styling without duplicating inline objects.
 * 
 * Usage:
 *   import { colors, glass, glow, typography } from '../styles/theme';
 */

export const colors = {
  bg: '#050508',
  bgSurface: 'rgba(10, 10, 15, 0.3)',
  bgElevated: 'rgba(20, 20, 30, 0.6)',
  cyan: '#0df2f2',
  purple: '#a45afe',
  green: '#00ffaa',
  red: '#ff3366',
  orange: '#ff7b00',
  yellow: '#fce205',
  textPrimary: '#e0e5ff',
  textSecondary: '#8890b5',
  textMuted: '#4a5070',
  textBright: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.05)',
  borderActive: 'rgba(13, 242, 242, 0.3)',
};

export const glass = {
  light: {
    background: colors.bgSurface,
    backdropFilter: 'blur(50px)',
    border: `1px solid ${colors.border}`,
  },
  heavy: {
    background: 'rgba(10, 10, 15, 0.5)',
    backdropFilter: 'blur(80px)',
    border: `1px solid rgba(13, 242, 242, 0.1)`,
  },
};

export const glow = {
  cyan: `0 0 40px rgba(13, 242, 242, 0.3)`,
  cyanIntense: `0 0 60px rgba(13, 242, 242, 0.5), inset 0 0 20px rgba(255,255,255,0.3)`,
  purple: `0 0 40px rgba(164, 90, 254, 0.3)`,
  card: `0 20px 60px rgba(0, 0, 0, 0.6)`,
};

export const typography = {
  heroTitle: {
    fontSize: 'clamp(48px, 6vw, 85px)',
    fontWeight: 950,
    lineHeight: 1.05,
    letterSpacing: '-2px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 950,
    letterSpacing: '-1px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.textBright,
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
    color: colors.textSecondary,
    lineHeight: 1.6,
  },
  mono: {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: '14px',
  },
};

export const gradients = {
  cyanToPurple: `linear-gradient(135deg, ${colors.cyan} 0%, ${colors.purple} 100%)`,
  neonButton: `linear-gradient(135deg, ${colors.cyan} 0%, #1771f1 100%)`,
};

export const card = {
  ...glass.light,
  borderRadius: '32px',
  padding: '40px',
  boxShadow: glow.card,
  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s, border-color 0.4s',
  cursor: 'pointer',
};

export const grid = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
  `,
  backgroundSize: '30px 30px',
};

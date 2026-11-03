/**
 * Reverb design tokens. Palette: midnight indigo surfaces, lilac text, one periwinkle accent,
 * and a warm "pulse" gold used ONLY for live playback indicators.
 * Motif: ripple rings (the sound of a room after the note ends) — see Artwork and the Now Playing halo.
 */
export const colors = {
  bg: '#1A1640',
  surface: '#241F52',
  raised: '#2F2967',
  border: 'rgba(244,240,255,0.10)',
  text: '#F4F0FF',
  muted: '#A9A3CF',
  accent: '#9AA5FF',
  accentInk: '#13103A',
  pulse: '#FFD36E',
  danger: '#FF7A90',
  scrim: 'rgba(10,8,30,0.62)',
} as const;

export const fonts = {
  regular: 'BricolageGrotesque_400Regular',
  medium: 'BricolageGrotesque_500Medium',
  semi: 'BricolageGrotesque_600SemiBold',
  bold: 'BricolageGrotesque_800ExtraBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 22, pill: 999 } as const;

export const MINI_PLAYER_HEIGHT = 64;

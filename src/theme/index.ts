export const colors = {
  background: '#F8F7F4', // Warm off-white
  surface: '#FFFFFF', // Cards
  textPrimary: '#1A1A2E', // Deep navy-charcoal
  textSecondary: '#6B7280', // Muted gray
  textTertiary: '#9CA3AF', // Light gray
  
  accentPrimary: '#7C6BF0', // Soft lavender-purple
  accentWarm: '#F5A623', // Warm amber
  accentBlue: '#5B9BD5', // Gentle blue
  accentGreen: '#6BBF7A', // Soft green — positive indicators
  accentRose: '#E8828A', // Soft rose — gentle attention
  
  cardShadow: 'rgba(0,0,0,0.04)',
  divider: '#F0EDE8', // Barely visible warm gray
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Assuming Inter font will be loaded
export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3 },
  headline: { fontSize: 18, fontWeight: '600' as const, letterSpacing: 0 },
  body: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0 },
  caption: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0.2 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
};

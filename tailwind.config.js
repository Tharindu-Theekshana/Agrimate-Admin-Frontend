/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Map Tailwind color utilities to the CSS variables in index.css so
      // dark/light theming (data-theme) works automatically.
      colors: {
        background: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        primary: 'var(--primary)',
        'primary-deep': 'var(--primary-deep)',
        accent: 'var(--accent)',
        pale: 'var(--pale)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-faint': 'var(--ink-faint)',
        border: 'var(--border)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        sidebar: 'var(--sidebar)',
      },
      borderRadius: { card: 'var(--radius)' },
    },
  },
  plugins: [],
};

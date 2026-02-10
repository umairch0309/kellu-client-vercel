import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px (was 12px)
        sm: ['0.9375rem', { lineHeight: '1.375rem' }],  // 15px (was 14px)
        base: ['1.0625rem', { lineHeight: '1.625rem' }], // 17px (was 16px)
      },
      colors: {
        primary: {
          DEFAULT: '#2B50AA',
          dark: '#1F3A7A',
          light: '#4A6BC4',
        },
        secondary: {
          DEFAULT: '#28AFB0',
          dark: '#1E8A8B',
          light: '#4FC4C5',
        },
        tertiary: {
          DEFAULT: '#B084CC',
          dark: '#8B6AA3',
          light: '#C9A3DD',
        },
        neutral: {
          dark: '#1F271B',
          light: '#EAEBED',
        },
        sidebar: {
          bg: '#fbf8f2',
          banner: '#e6f0f8',
          text: '#212b36',
        },
      },
    },
  },
  plugins: [],
}
export default config


import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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


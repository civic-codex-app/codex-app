import type { Config } from 'tailwindcss'

const config: Config = {
  future: {
    // Emit every `hover:` utility inside
    // `@media (hover: hover) and (pointer: fine)`.
    //
    // Without this, a tap on a touch screen leaves :hover stuck on the element
    // until you tap something else — so the nine `hover:-translate-y-0.5
    // hover:shadow-md` cards stay lifted after you have already navigated
    // away and come back. There are 399 hover: usages across 129 files and no
    // `active:` variants at all, so on a phone the hover styles were the only
    // press feedback, appearing at the wrong time and never leaving.
    //
    // Touchscreen laptops report `hover: hover, pointer: fine` and are
    // unaffected. Desktop output is byte-identical apart from the wrapper.
    hoverOnlyWhenSupported: true,
  },
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        poli: {
          bg: '#050505',
          card: '#0A0A0A',
          'bg-light': '#FAFAF8',
          'card-light': '#FFFFFF',
        },
        democrat: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
        },
        republican: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
        },
        green: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
        },
        independent: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Durations and easings resolve to the CSS custom properties defined in
      // app/globals.css, so a token changes in one place. `400` is listed
      // explicitly because app/(public)/layout.tsx already ships
      // `duration-400` for the app-wide theme crossfade — it is not in
      // Tailwind's default scale, so that class never compiled and the
      // transition has been running at the 150ms default.
      transitionDuration: {
        1: 'var(--dur-1)',
        2: 'var(--dur-2)',
        3: 'var(--dur-3)',
        4: 'var(--dur-4)',
        5: 'var(--dur-5)',
        400: '400ms',
      },
      transitionTimingFunction: {
        ios: 'var(--ease-out)',
        'ios-in': 'var(--ease-in)',
        'ios-in-out': 'var(--ease-in-out)',
        emphasized: 'var(--ease-emphasized)',
        spring: 'var(--ease-spring)',
        sheet: 'var(--ease-sheet)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // components/onboarding/onboarding-wizard.tsx has shipped
        // `animate-fade-in` since before there was a fadeIn keyframe, so the
        // class has always been inert. Defining it makes the existing markup
        // mean what it says.
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        sheetUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        // `slide-in` / the slideIn keyframe are dropped: zero usages, and
        // sheetUp is the shape the overlays actually need.
        'fade-up': 'fadeUp var(--dur-4) var(--ease-out)',
        'fade-in': 'fadeIn var(--dur-3) var(--ease-out)',
        'sheet-up': 'sheetUp var(--dur-3) var(--ease-sheet)',
        'scale-in': 'scaleIn var(--dur-3) var(--ease-spring)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config

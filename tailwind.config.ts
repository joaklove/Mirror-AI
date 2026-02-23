import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// 高级暗色配色
				premium: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#020617',
				},
				// 金色系
				gold: {
					50: '#fefce8',
					100: '#fef9c3',
					200: '#fef08a',
					300: '#fde047',
					400: '#facc15',
					500: '#eab308',
					600: '#ca8a04',
					700: '#a16207',
					800: '#854d0e',
					900: '#713f12',
				},
				// 维度配色 - 更鲜艳
				dimension: {
					psychology: '#f43f5e',
					cognitive: '#38bdf8',
					efficiency: '#fbbf24',
					social: '#a78bfa',
					health: '#34d399',
					finance: '#94a3b8',
				},
				// 翡翠绿
				jade: {
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
				},
			},
			fontFamily: {
				sans: ['Noto Sans SC', 'Inter', 'system-ui', 'sans-serif'],
				serif: ['Noto Serif SC', 'Georgia', 'serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'jade': '0 4px 20px rgba(13, 148, 136, 0.15)',
				'jade-sm': '0 2px 8px rgba(13, 148, 136, 0.1)',
				'jade-lg': '0 8px 30px rgba(13, 148, 136, 0.2)',
				'float': '0 4px 12px rgba(0, 0, 0, 0.08)',
				// 高级阴影
				'premium': '0 8px 32px rgba(0, 0, 0, 0.4)',
				'premium-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
				'premium-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
				'gold': '0 4px 20px rgba(202, 138, 4, 0.3)',
				'gold-lg': '0 8px 30px rgba(202, 138, 4, 0.4)',
				'glow-gold': '0 0 20px rgba(202, 138, 4, 0.3)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float-up': {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(-8px)', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float-up': 'float-up 2s ease-out infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
			},
			backgroundImage: {
				'gradient-mist': 'linear-gradient(180deg, #FAFAF9 0%, #F5F5F4 100%)',
				'gradient-dawn': 'linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 100%)',
				'gradient-jade': 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
				// 高级暗色渐变
				'gradient-premium': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
				'gradient-gold': 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;

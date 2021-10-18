/* eslint-disable import/no-extraneous-dependencies */
const lineClamp = require("@tailwindcss/line-clamp");

module.exports = {
	purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	darkMode: false, // or 'media' or 'class'
	theme: {
		// scale: {
		// 	120: '1.2'
		// },
		extend: {
			screens: {
				// "2xl": { max: "1535px" },
				laptop: { max: "1279px" },
				// xl: { max: "1279px" },
				tablet: { max: "1024px" },
				// lg: { max: "1023px" },
				mobile: { max: "639px" },
				// md: { max: "767px" },
				// sm: { max: "639px" },
			},
			// fontFamily: {
			// 	sans: ["var(--font-family)", ...defaultTheme.fontFamily.sans],
			// 	"sans-serif": [
			// 		"var(--font-family)",
			// 		...defaultTheme.fontFamily.serif,
			// 	],
			// },
			colors: {
				primary: "#2C3D94",
				secondary: "#EAECF4",
				blue: {
					250: "#E8F2FC",
				},
				gray: {
					40: "#999999",
					60: "#666666",
					80: '#333333',
					400: "#78909C",
					300: "#FAFAFA",
					100: "#CFD8DC",
					350: "#666666",
					200: "#F0F0F0",
					250: "#F8F8F8",
					50: "#F6EFEE",
					150: "#E5E5E5",
					800: "#37474F",
					700: "#2D3047",
					600: "#CCCCCC",
					850: "#263238",
					DEFAULT: "#F2F2F2",
				},
				main: "#fcfcfd",
				green: {
					400: "#22AAA1",
				},
				yellow: {
					400: "#FFB300",
					450: '#F4BF1B',
				},
				black: {
					DEFAULT: '#333333'
				}

			},
			inset: {
				"14-i": "3.5rem !important",
				"1/43": "43% !important",
			},
			margin: {
				"0-i": "0 !important",
				"2-i": "0.5rem !important",
			},
			padding: {
				"0-i": "0 !important",
				"3-i": "0.75rem !important",
				full: "100%"
			},

			borderRadius: {
				"full-i": "9999px !important",
			},
			minWidth: {
				12: "12rem !important",
				3: "3rem !important",
				64: "16rem !important",
			},
			width: {
				68: "17rem !important",
				"3/4-i": "75% !important",
				98: "28rem !important",
				'1-3': '33.5%'
			},
			height: {
				100: "36rem !important",
				'banner-sm': "512px",
				banner: "665px"
			},
			lineHeight: {
				0: '0',
			},
			minHeight: {
				24: '6rem'
			},
			zIndex: {
				max: 999,
				"2max": 10000,
			},
			cursor: {
				allScroll: "all-scroll",
			},
			boxShadow: {
				card: "0 4px 24px 0 rgb(34 41 47 / 10%)",
				"card-sm": "0px 0px 20px rgba(0, 0, 0, 0.1)",
				header: "0px 0px 10px rgba(0, 0, 0, 0.2)"
			},
			animation: {
				'flower': 'flower 0.3s ease-in',
				'zoomOut': 'zoomOut 0.3s ease-in-out',
				'run': 'run 0.2s ease-in',
				'zoomIn': 'zoomIn 0.4s ease-in',
				'card': 'card 0.4s ease-in',
				'fadeIn': 'fadeIn 0.3s ease',
			},
			keyframes: {
				flower: {
					'0%': { transform: 'scaleY(0.8)', opacity: 0.6 },
					'100%': { transform: 'scaleY(1)', opacity: 1 },
				},
				zoomOut: {
					'0%': { transform: 'scale(0.95)', opacity: 0 },
					'100%': { transform: 'scale(1)', opacity: 1 },
				},
				run: {
					'0%': { transform: 'translateY(-20px)' },
					'100%': { transform: 'translateY(0px)' },
				},
				zoomIn: {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(1.2)' },
				},
				card: {
					'0%': { opacity: 0, scale: 0.85 },
					'100%': { opacity: 1, scale: 1 },
				},
				fadeIn: {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 },
				}
			}
		},
	},
	variants: {
		extend: {
			opacity: ["disabled"],
			transform: ["hover", "focus"],
			cursor: ['hover'],
			display: ['hover', 'focus', 'group-hover', 'group-focus'],
			animation: ['hover'],
			scale: ['hover'],
			padding: ['hover']
		},
	},
	plugins: [lineClamp],
};

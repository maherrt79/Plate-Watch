/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Void Background: Deepest background, main canvas
                void: '#0B0C10',

                // Surface Layer: Card backgrounds, panels
                surface: '#1F2833',

                // Border/Divider: Subtle teal
                structure: 'rgba(69, 162, 158, 0.2)', // #45A29E at 20%

                // Primary Action (Cyan): Buttons, active states, main focus
                'neon-cyan': '#66FCF1',

                // Secondary Data (Cool Grey): Text, secondary icons
                'cool-grey': '#C5C6C7',

                // Alert Status Colors
                'alert-critical': '#FF003C', // Pulse Red
                'alert-warning': '#F7B500',  // Amber
                'alert-safe': '#00F0FF',     // Emerald/Cyan hybrid
            },
            fontFamily: {
                mono: ['"Roboto Mono"', '"JetBrains Mono"', 'monospace'],
                sans: ['Inter', 'Rajdhani', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 15px var(--primary-cyan)',
            }
        },
    },
    plugins: [],
}

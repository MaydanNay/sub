/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                shupixel: ['"Press Start 2P"', 'cursive'],
                shubody: ['Play', 'sans-serif'],
                tektur: ['Tektur', 'sans-serif'],
                montserrat: ['Montserrat', 'sans-serif'],
            },
            colors: {
                'shu-pink': '#E66D7A',
                'shu-blue': '#7BCFF6',
                'shu-bg': '#232323',
                'shu-card': '#1a1a1a',
                'shu-neon': '#39FF14',
                'shu-yellow': '#ffff00',
            },
            borderWidth: {
                '4': '4px',
            },
            boxShadow: {
                'pixel': '4px 4px 0px 0px rgba(255, 255, 255, 0.5)',
                'pixel-sm': '2px 2px 0px 0px rgba(255, 255, 255, 0.5)',
                'pixel-lg': '6px 6px 0px 0px rgba(255, 255, 255, 0.8)',
            }
        },
    },
    plugins: [],
}

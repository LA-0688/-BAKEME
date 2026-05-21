/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          cream: '#FCFBF7',     // Dough/Cream color for background
          wheat: '#F5ECE1',     // Soft wheat tone
          crust: '#D98324',     // Rich baked crust golden-orange
          amber: '#8F5310',     // Deep amber warm brown
          charcoal: '#1C160E',  // Dark espresso color for typography
          gold: '#C5A880',      // Wheat gold color for accents
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
}

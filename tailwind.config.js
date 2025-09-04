const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flyonui/dist/js/*.js', // FlyonUI JS components
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('flyonui'), // FlyonUI plugin
    iconsPlugin({
      collections: getIconCollections(['mdi', 'tabler']),
    }),
  ],
  flyonui: {
    themes: ['light', 'dark', 'corporate', 'luxury'] // Include the themes you want
  }
} 
/** @type {import('tailwindcss').Config} */
export default {
        purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
        theme: {
                extend: {},
        },
        plugins: [
                require("@tailwindcss/typography"), require('daisyui')
        ],
        daisyui: {
                themes: [
                        {
                                light: {
                                        ...require("daisyui/src/theming/themes")["dark"],
                                        "background": "#0A0A0A" // Make the background even darker to match the
                                                                // viewport theme
                                }
                        }
                ]
        }
}


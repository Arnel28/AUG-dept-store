/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#0D0D0D",    // page background — deep charcoal, not harsh black
        surface: "#1C1C1C",  // card / input — elevated dark layer
        ink: "#F0F0F0",      // primary text — warm off-white, not blinding
        graphite: "#BDBDBD", // body copy — medium light grey
        muted: "#6B6B6B",    // secondary text — recessed grey
        line: "#2C2C2C",     // borders — subtle dark separator
        accent: "#A8A8A8",   // interaction — soft silver hover
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "Georgia", "serif"],
        sans: [
          '"Hanken Grotesk"',
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        prose: "62ch",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(1.25rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        fade: "fade 1.2s ease both",
      },
    },
  },
  plugins: [],
};

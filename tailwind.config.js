/** @type {import('tailwindcss').Config} */
module.exports = {
  // Importante: adicione o caminho do seu global.css aqui também se necessário, 
  // mas o principal são os arquivos de componentes
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
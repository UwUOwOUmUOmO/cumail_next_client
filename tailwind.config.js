/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sidebar': '#1e1f22',
        'sidebaricon': '#313338',
        'channelbar': '#2b2d31',
        'chatbg': '#2e3035',
        'chatbox': '#383a40',
        'btndefault': '#4e5058',
        'btnactive': '#6d6f78',
        'loginbg': '#313338',
        'loginbtn': '#5865f2',
        'loginbtnpressed': '#4752c4',
        'loginbtnlight': '#5D6BFF',
        'loginbar': '#1e1f22',
        'discordlogo': '#5a6af3',
      }
    },
  },
  plugins: [],
}
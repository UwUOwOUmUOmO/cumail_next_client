// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ClickJackingWarning from "./components/ClickJackingWarning.tsx";


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    window.self === window.top ?
        <App />
        : <ClickJackingWarning />
)

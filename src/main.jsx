import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GameProvider } from './context/GameContext';

// Import CSS stylesheets
import './styles/global.css';
import './styles/components.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/wallet.css';
import './styles/lobby.css';
import './styles/game.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GameProvider>
        <App />
      </GameProvider>
    </BrowserRouter>
  </React.StrictMode>
);

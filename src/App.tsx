// src/App.tsx
import React from 'react';
import Chat from './components/Chat';
import './App.css';
import logo from './logo.png'; // Adjust the path to where your actual logo isc:\Users\User\Dropbox\Bugcrusher Dropbox\openai-react\src\logo.png

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faWarning, faHouse, faTablet, faAngleDown,faRobot} from '@fortawesome/free-solid-svg-icons'

const App: React.FC = () => {
  return (
    <div className="App">
        <header className="header-chatbot">
        <div className="header-menu-chatbot">
          <div className="header-chatbot flex-row-chatbot">
            <div className="bg-typetext-area">
              <div className="typewriter">
                <h1><FontAwesomeIcon icon={faRobot} />  Let's Chat About SDGs</h1>
              </div>
            </div>  
          </div>
        </div>
      </header>
      <main>
        <Chat />
      </main>
    </div>
  );
};

export default App;

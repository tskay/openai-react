// src/App.tsx
import React from 'react';
import Chat from './components/Chat';
import './App.css';
import logo from './logo.png'; // Adjust the path to where your actual logo isc:\Users\User\Dropbox\Bugcrusher Dropbox\openai-react\src\logo.png

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faWarning, faHouse, faTablet, faAngleDown} from '@fortawesome/free-solid-svg-icons'

const App: React.FC = () => {
  return (
    <div className="App">
        <header className="header-duuuurian">
        <div className="header-menu-duuuurian">
          <div className="header-duuuurian flex-row-duuuurian container-duuuurian">
            <div className="flex-col-duuuurian flex-right-duuuurian">
              <ul className="nav-duuuurian nav-right-duuuurian nav-spacing-duuuurian">
                <li>
                  <a href="index.html"><button className="hover-button">
                    <FontAwesomeIcon icon={faHouse} />
                    <span className="button-text">Home</span>
                </button></a>
                </li>
                <li>
                  <a href="negatives.html"><button className="hover-button">
                  <FontAwesomeIcon icon={faWarning} />
                    <span className="button-text">Negative Effect</span>
                </button></a>
                </li>
                <li>
                  <a href="kts_test.html"><button className="hover-button">
                  <FontAwesomeIcon icon={faTablet} />
                    <span className="button-text">Test</span>
                </button></a>
                </li>
                <li>
                  <a href="#">SDGs
                    <span>
                    <FontAwesomeIcon icon={faAngleDown} />
                    </span>
                    <ul>
                      <li>
                        <a href="" className="assd">SDG Info</a>
                      </li>
                      <li>
                        <a href="" className="assd">SDG Games</a>
                      </li>
                    </ul>
                  </a>
                </li>
              </ul>
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

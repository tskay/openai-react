// src/App.tsx
import React from 'react';
import Chat from './components/Chat';
import './App.css';
import logo from './logo.png'; // Adjust the path to where your actual logo is


function MainContent() {
  return (
    <main className="main-content">
      <h1>Types of Road Signs In Malaysia</h1>
      <p>
        As we traverse the vibrant roads of Malaysia, we become part of a diverse and bustling transportation system.
        However, amidst the beauty and excitement, road safety remains of paramount importance. Malaysia's comprehensive
        array of traffic signs serves as a vital tool in ensuring the safety of drivers, pedestrians, and cyclists. In
        this post, we will explore the correlation between road safety and Malaysia's distinct categories of traffic
        signs: warning signs, mandatory signs, priority signs, prohibitory signs, and information signs. Join us as we
        unravel the significance of these signs in fostering a culture of road safety across the nation.
      </p>
    </main>
  );
}

const App: React.FC = () => {
  return (
    <div className="App">
      <header id="site-header">
        <div className="header-inner">
          <div className="site-logo">
          <img src={logo} alt="Logo" />
          </div>
          <div className="menu-wrap">
          </div>
        </div>
        <div className="header-bottom">
          <div className="flex-row">
            <nav>
              <ul className="menu-text">
                <li>
                  <a href="index.html">Home</a>
                </li>
                <li>
                  <a href="#">Info
                    <span>
                      <i className="fa fa-angle-down" aria-hidden="true"></i>
                    </span>
                    <ul>
                      <li>
                        <a href="road-sign.html">Road Sign Malaysia</a>
                      </li>
                      <li>
                        <a href="special-day.html">Special Days</a>
                      </li>
                      <li>
                        <a href="data.html">bar chart data</a>
                      </li>
                    </ul>
                  </a>
                </li>
                <li>
                  <a href="research-pillar.html">Research</a>
                </li>
                <li>
                  <a href="SDG/sdglandpage.html">SDG</a>
                </li>
                <li>
                  <a href="#">Learn
                    <span>
                      <i className="fa fa-angle-down" aria-hidden="true"></i>
                    </span>
                    <ul>
                      <li>
                        <a href="car_go_brrrrrrrr.html">Drive Simulator</a>
                      </li>
                      <li>
                        <a href="quiz.html">Quiz</a>
                      </li>
                      <li>
                        <a href="card_game.html">Card Game</a>
                      </li>
                    </ul>
                  </a>
                </li>
              </ul>
            </nav>
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

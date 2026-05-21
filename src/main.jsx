import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>SMKR Power Partner Platform</h1>
        <p>Outreach · Referrals · Metrics · Operations</p>
      </aside>
      <main className="main-panel">
        <div className="hero-card">
          <span className="tag">ServiceMaster KWIK Restore</span>
          <h2>Build the room. Track the relationship. Move the referral forward.</h2>
          <p>
            Internal BDM operating system for Power Partners, touchpoints,
            follow-ups, expenses, operations, and referral tracking.
          </p>
          <button>Launch Platform</button>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

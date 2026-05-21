import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { apiPost, getApiStatus } from './api';

const stats = [
  ['Contacts', '124', 'relationship database'],
  ['Invites Sent', '38', 'Power Partners outreach'],
  ['RSVPs', '11', 'confirmed or pending'],
  ['Open Follow-Ups', '17', 'due this week'],
  ['Touchpoints', '42', 'BDM activity'],
  ['Ops Requests', '4', 'internal support'],
];

const invites = [
  ['Tomei Insurance Agency', 'Insurance', 'Gurnee', 'Insurance & Escalation', 'Priority Invite'],
  ["West's Insurance Agency", 'Insurance', 'Gurnee', 'Commercial Property', 'Priority Invite'],
  ['Michael Logue Insurance', 'Insurance', 'Gurnee', 'Residential Referral', 'Invite Ready'],
  ['Commercial Broker Seat', 'CRE', 'Lake County', 'Commercial Property', 'Identify Target'],
];

const followUps = [
  'Send Power Partners invite to Tomei Insurance Agency',
  "Confirm best point of contact at West's Insurance Agency",
  'Build realtor cluster LinkedIn touchpoint batch',
  'Identify one commercial broker for founding seat',
];

const modules = ['Dashboard','Power Partners','Contacts','Follow-Ups','Touchpoints','Expenses','Operations','Surveys','Settings'];

function App() {
  const [touchpointCompany, setTouchpointCompany] = useState('');
  const [touchpointType, setTouchpointType] = useState('Email');
  const [apiMessage, setApiMessage] = useState('');

  async function logTouchpoint() {
    const result = await apiPost('logTouchpoint', {
      BDM: 'Brandon Bynum',
      Contact_Company: touchpointCompany,
      Touchpoint_Type: touchpointType,
      Pipeline_Stage: 'Engaged',
      Outcome: 'Touchpoint logged through platform'
    });

    if (result.ok) {
      setApiMessage('Touchpoint submitted successfully.');
      setTouchpointCompany('');
    } else {
      setApiMessage('API connection pending. Touchpoint staged locally.');
    }
  }

  async function sendInvite(contact) {
    const result = await apiPost('sendInvite', {
      Contact_Company: contact,
      Owner: 'Brandon Bynum',
      Cluster: 'Power Partners Weekly'
    });

    if (result.ok) {
      setApiMessage(`Invite action sent for ${contact}.`);
    } else {
      setApiMessage(`Invite staged locally for ${contact}.`);
    }
  }

  return (
    <div className="platform">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">SMKR</div>
          <h1>Power Partner Platform</h1>
          <p>Outreach · Referrals · Metrics · Operations</p>
        </div>

        <nav>
          {modules.map((item, index) => (
            <button className={index === 0 ? 'nav-active' : ''} key={item}>{item}</button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <strong>Found. Chosen. Remembered.</strong>
          <span>Gurnee & Cary, Illinois</span>
          <small>{getApiStatus()}</small>
        </div>
      </aside>

      <main className="workspace">
        <section className="hero">
          <div>
            <span className="eyebrow">ServiceMaster KWIK Restore</span>
            <h2>Build the room. Track the relationship. Move the referral forward.</h2>
            <p>Centralized BDM operating system for Power Partners, touchpoints, follow-ups, expenses, operations, and referral tracking.</p>
          </div>

          <div className="hero-actions">
            <a href="https://genuine-flan-635798.netlify.app/" target="_blank" rel="noreferrer">View RSVP Page</a>
            <button onClick={() => setApiMessage('Bulk invite workflow opening soon.')}>Send Invite</button>
          </div>
        </section>

        {apiMessage && (
          <section className="api-banner">
            {apiMessage}
          </section>
        )}

        <section className="stats-grid">
          {stats.map(([label, value, note]) => (
            <article className="stat-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{note}</p>
            </article>
          ))}
        </section>

        <section className="two-column">
          <article className="panel dark-panel">
            <span className="eyebrow yellow">This Week's Room</span>
            <h3>Insurance & Escalation Cluster</h3>
            <p>Wednesday · 8:00-9:00 AM · ServiceMaster KWIK Restore HQ, Gurnee</p>

            <div className="room-grid">
              <div><span>Confirmed</span><strong>5</strong></div>
              <div><span>Open Seats</span><strong>3</strong></div>
              <div><span>Target Size</span><strong>8</strong></div>
            </div>

            <div className="action-row">
              <button onClick={() => setApiMessage('Invite center launching.')}>Send Invite</button>
              <button className="outline">Copy LinkedIn DM</button>
            </div>
          </article>

          <article className="panel">
            <span className="eyebrow">Open Follow-Ups</span>
            <h3>Next Relationship Actions</h3>

            <ul className="task-list">
              {followUps.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">Power Partners Invite Center</span>
              <h3>Priority Invite Queue</h3>
            </div>

            <button onClick={() => setApiMessage('Contact creation workflow opening soon.')}>Add Contact</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Vertical</th>
                  <th>Market</th>
                  <th>Cluster</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {invites.map(([contact, vertical, market, cluster, status]) => (
                  <tr key={contact}>
                    <td>{contact}</td>
                    <td>{vertical}</td>
                    <td>{market}</td>
                    <td>{cluster}</td>
                    <td><span className="pill">{status}</span></td>
                    <td><button className="small" onClick={() => sendInvite(contact)}>Send</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="two-column lower">
          <article className="panel">
            <span className="eyebrow">Quick Log</span>
            <h3>BDM Touchpoint</h3>

            <div className="form-grid">
              <input value={touchpointCompany} onChange={(e) => setTouchpointCompany(e.target.value)} placeholder="Contact / Company" />

              <select value={touchpointType} onChange={(e) => setTouchpointType(e.target.value)}>
                <option>Email</option>
                <option>Call</option>
                <option>In-Person</option>
                <option>LinkedIn</option>
              </select>

              <select>
                <option>Pipeline Stage</option>
                <option>Prospect</option>
                <option>Engaged</option>
                <option>Evaluating</option>
                <option>Partner</option>
              </select>

              <button onClick={logTouchpoint}>Log</button>
            </div>
          </article>

          <article className="panel">
            <span className="eyebrow">Operations</span>
            <h3>Support Snapshot</h3>

            <div className="ops-list">
              <div><span>Open Ops Requests</span><strong>4</strong></div>
              <div><span>Expenses Pending</span><strong>5</strong></div>
              <div><span>Survey Follow-Ups</span><strong>3</strong></div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { apiGet, apiPost, getApiStatus } from './api';

const modules = ['Dashboard','Power Partners','Contacts','Touchpoints','Operations','Expenses','Surveys','Settings'];

const fallbackContacts = [
  { Company: 'Tomei Insurance Agency', First_Name: 'Tomei', Last_Name: 'Agency', Vertical: 'Insurance', Market: 'Gurnee', Email: '', Status: 'Priority Invite', Cluster: 'Insurance & Escalation' },
  { Company: "West's Insurance Agency", First_Name: 'West', Last_Name: 'Agency', Vertical: 'Insurance', Market: 'Gurnee', Email: '', Status: 'Priority Invite', Cluster: 'Commercial Property' },
  { Company: 'Michael Logue Insurance', First_Name: 'Michael', Last_Name: 'Logue', Vertical: 'Insurance', Market: 'Gurnee', Email: '', Status: 'Invite Ready', Cluster: 'Residential Referral' }
];

function App() {
  const [metrics, setMetrics] = useState({ contacts: 0, invites: 0, rsvps: 0, touchpoints: 0, opsRequests: 0, expenses: 0 });
  const [contacts, setContacts] = useState(fallbackContacts);
  const [activity, setActivity] = useState(['Platform loaded', 'Google Sheet API ready']);
  const [apiMessage, setApiMessage] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ First_Name: '', Last_Name: '', Company: '', Title: '', Vertical: 'Insurance', Market: 'Gurnee', Email: '', Phone: '', Priority: 'High', Cluster: 'Power Partners Weekly', Owner: 'Brandon Bynum', Status: 'New' });
  const [touchpoint, setTouchpoint] = useState({ Contact_Company: '', Vertical: 'Insurance', Market: 'Gurnee', Touchpoint_Type: 'Email', Pipeline_Stage: 'Engaged', Outcome: '', Next_Step: '' });

  const statCards = useMemo(() => [
    ['Contacts', metrics.contacts || contacts.length, 'live relationship database'],
    ['Invites Sent', metrics.invites || 0, 'Power Partners outreach'],
    ['RSVPs', metrics.rsvps || 0, 'confirmed or pending'],
    ['Touchpoints', metrics.touchpoints || 0, 'BDM activity'],
    ['Ops Requests', metrics.opsRequests || 0, 'internal support'],
    ['Expenses', metrics.expenses || 0, 'approval queue']
  ], [metrics, contacts.length]);

  async function refreshDashboard() {
    const dashboard = await apiGet('dashboard');
    if (dashboard && dashboard.ok) setMetrics(dashboard);

    const liveContacts = await apiGet('contacts');
    if (Array.isArray(liveContacts) && liveContacts.length) setContacts(liveContacts);

    setActivity(prev => ['Dashboard refreshed from Google Sheet', ...prev].slice(0, 8));
  }

  useEffect(() => { refreshDashboard(); }, []);

  async function addContact() {
    const result = await apiPost('addContact', contactForm);
    setApiMessage(result.ok ? 'Contact submitted to Google Sheet.' : 'Contact staged. Check Apps Script access.');
    setActivity(prev => [`Contact added: ${contactForm.Company}`, ...prev].slice(0, 8));
    setContacts(prev => [contactForm, ...prev]);
    setShowContactModal(false);
  }

  async function logTouchpoint() {
    const payload = { BDM: 'Brandon Bynum', ...touchpoint, Qualifying_Touchpoint: 'TRUE', Revenue_Opportunity: '', Notes: 'Logged from V2.4 dashboard' };
    const result = await apiPost('logTouchpoint', payload);
    setApiMessage(result.ok ? 'Touchpoint submitted to Google Sheet.' : 'Touchpoint staged. Check Apps Script access.');
    setActivity(prev => [`Touchpoint logged: ${touchpoint.Contact_Company}`, ...prev].slice(0, 8));
    setTouchpoint({ ...touchpoint, Contact_Company: '', Outcome: '', Next_Step: '' });
  }

  async function sendInvite(contact) {
    const result = await apiPost('sendInvite', { Contact_Name: `${contact.First_Name || ''} ${contact.Last_Name || ''}`.trim() || contact.Company, Email: contact.Email, Contact_Company: contact.Company, Owner: 'Brandon Bynum', Cluster: contact.Cluster || 'Power Partners Weekly' });
    setApiMessage(result.ok ? `Invite workflow submitted for ${contact.Company}.` : `Invite staged for ${contact.Company}.`);
    setActivity(prev => [`Invite action: ${contact.Company}`, ...prev].slice(0, 8));
  }

  return (
    <div className="platform">
      <aside className="sidebar">
        <div className="brand-lockup"><div className="brand-mark">SMKR</div><h1>Power Partner Platform</h1><p>Outreach · Referrals · Metrics · Operations</p></div>
        <nav>{modules.map((item, index) => <button className={index === 0 ? 'nav-active' : ''} key={item}>{item}</button>)}</nav>
        <div className="sidebar-footer"><strong>Found. Chosen. Remembered.</strong><span>Gurnee & Cary, Illinois</span><small>{getApiStatus()}</small></div>
      </aside>

      <main className="workspace">
        <section className="hero">
          <div><span className="eyebrow">Live Operational Command Center</span><h2>Build the room. Track the relationship. Move the referral forward.</h2><p>Live Google Sheet dashboard for contacts, invites, touchpoints, operations, expenses, surveys, and BDM KPI visibility.</p></div>
          <div className="hero-actions"><a href="https://genuine-flan-635798.netlify.app/" target="_blank" rel="noreferrer">View RSVP Page</a><button onClick={refreshDashboard}>Refresh Live Data</button></div>
        </section>

        {apiMessage && <section className="api-banner">{apiMessage}</section>}

        <section className="stats-grid">{statCards.map(([label, value, note]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong><p>{note}</p></article>)}</section>

        <section className="two-column">
          <article className="panel dark-panel"><span className="eyebrow yellow">BDM KPI Tracking</span><h3>Weekly Power Partner Motion</h3><p>Track founding seats, invite actions, touchpoints, and operational queues from one live command center.</p><div className="room-grid"><div><span>Target Seats</span><strong>8</strong></div><div><span>Active Contacts</span><strong>{contacts.length}</strong></div><div><span>Touchpoints</span><strong>{metrics.touchpoints || 0}</strong></div></div><div className="action-row"><button onClick={() => setShowContactModal(true)}>Add Contact</button><button className="outline" onClick={refreshDashboard}>Refresh</button></div></article>
          <article className="panel"><span className="eyebrow">Real-Time Activity Feed</span><h3>Latest Platform Actions</h3><ul className="task-list">{activity.map((item, idx) => <li key={idx}>{item}</li>)}</ul></article>
        </section>

        <section className="panel"><div className="section-header"><div><span className="eyebrow">Live Contact Table</span><h3>Power Partner Contact Database</h3></div><button onClick={() => setShowContactModal(true)}>Add Contact</button></div><div className="table-wrap"><table><thead><tr><th>Company</th><th>Name</th><th>Vertical</th><th>Market</th><th>Email</th><th>Status</th><th>Action</th></tr></thead><tbody>{contacts.map((c, idx) => <tr key={`${c.Company}-${idx}`}><td>{c.Company}</td><td>{`${c.First_Name || ''} ${c.Last_Name || ''}`}</td><td>{c.Vertical}</td><td>{c.Market}</td><td>{c.Email}</td><td><span className="pill">{c.Status || 'Active'}</span></td><td><button className="small" onClick={() => sendInvite(c)}>Invite</button></td></tr>)}</tbody></table></div></section>

        <section className="two-column lower"><article className="panel"><span className="eyebrow">Live Touchpoint Logger</span><h3>BDM Touchpoint</h3><div className="form-grid"><input value={touchpoint.Contact_Company} onChange={e => setTouchpoint({...touchpoint, Contact_Company: e.target.value})} placeholder="Contact / Company" /><select value={touchpoint.Touchpoint_Type} onChange={e => setTouchpoint({...touchpoint, Touchpoint_Type: e.target.value})}><option>Email</option><option>Call</option><option>In-Person</option><option>LinkedIn</option><option>Lunch & Learn</option></select><select value={touchpoint.Pipeline_Stage} onChange={e => setTouchpoint({...touchpoint, Pipeline_Stage: e.target.value})}><option>Prospect</option><option>Engaged</option><option>Evaluating</option><option>Partner</option></select><button onClick={logTouchpoint}>Log</button></div></article><article className="panel"><span className="eyebrow">Operational Queues</span><h3>Command Snapshot</h3><div className="ops-list"><div><span>Operations Requests</span><strong>{metrics.opsRequests || 0}</strong></div><div><span>Expense Queue</span><strong>{metrics.expenses || 0}</strong></div><div><span>Survey Responses</span><strong>{metrics.rsvps || 0}</strong></div></div></article></section>

        <section className="three-column lower"><article className="panel mini"><span className="eyebrow">Invite Analytics</span><strong>{metrics.invites || 0}</strong><p>Total invite records logged.</p></article><article className="panel mini"><span className="eyebrow">Touchpoint History</span><strong>{metrics.touchpoints || 0}</strong><p>Relationship-building actions captured.</p></article><article className="panel mini"><span className="eyebrow">Survey Viewer</span><strong>{metrics.rsvps || 0}</strong><p>RSVP and post-event response pipeline.</p></article></section>
      </main>

      {showContactModal && <div className="modal-backdrop"><div className="modal"><div className="section-header"><div><span className="eyebrow">Add Contact</span><h3>New Power Partner Contact</h3></div><button className="small" onClick={() => setShowContactModal(false)}>Close</button></div><div className="modal-grid"><input placeholder="First Name" value={contactForm.First_Name} onChange={e => setContactForm({...contactForm, First_Name: e.target.value})} /><input placeholder="Last Name" value={contactForm.Last_Name} onChange={e => setContactForm({...contactForm, Last_Name: e.target.value})} /><input placeholder="Company" value={contactForm.Company} onChange={e => setContactForm({...contactForm, Company: e.target.value})} /><input placeholder="Title" value={contactForm.Title} onChange={e => setContactForm({...contactForm, Title: e.target.value})} /><input placeholder="Email" value={contactForm.Email} onChange={e => setContactForm({...contactForm, Email: e.target.value})} /><input placeholder="Phone" value={contactForm.Phone} onChange={e => setContactForm({...contactForm, Phone: e.target.value})} /><select value={contactForm.Vertical} onChange={e => setContactForm({...contactForm, Vertical: e.target.value})}><option>Insurance</option><option>Real Estate</option><option>Commercial Broker</option><option>Property Management</option><option>Mortgage</option><option>Home Care</option></select><input placeholder="Market" value={contactForm.Market} onChange={e => setContactForm({...contactForm, Market: e.target.value})} /></div><button onClick={addContact}>Save Contact to Sheet</button></div></div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

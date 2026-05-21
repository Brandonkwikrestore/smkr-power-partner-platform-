const SHEET_ID = '1qeOi2XoYc_9GEh_3R70osM4KrO8s_29j_kHhmyoZBtY';
const RSVP_URL = 'https://genuine-flan-635798.netlify.app/';

const SCHEMA = {
  Contacts: ['Contact_ID','First_Name','Last_Name','Company','Title','Vertical','Market','Email','Phone','LinkedIn_URL','Priority','Cluster','Source','Owner','Status','Last_Touch','Next_Follow_Up','Notes','Created_At','Updated_At'],
  Invite_Log: ['Timestamp','Contact_ID','Contact_Name','Email','Invite_Type','Sent_By','Cluster','Status','Gmail_Message_ID','Notes'],
  RSVPs: ['Timestamp','First_Name','Last_Name','Email','Phone','Company','Role','Referral_Source','Requested_Session','RSVP_Status','Follow_Up_Needed','Notes'],
  Follow_Ups: ['Follow_Up_ID','Timestamp','Contact_ID','Contact_Name','Company','Owner','Follow_Up_Type','Due_Date','Priority','Status','Outcome','Notes'],
  Touchpoints: ['Timestamp','BDM','Contact_Company','Vertical','Market','Touchpoint_Type','Qualifying_Touchpoint','Pipeline_Stage','Outcome','Next_Step','Revenue_Opportunity','Notes'],
  Expenses: ['Timestamp','BDM','Expense_Date','Vendor','Category','Amount','Business_Purpose','Related_Contact_Event','Receipt_Link','Submitted_To','Approval_Status','Notes'],
  Operations_Requests: ['Request_ID','Timestamp','Submitted_By','Request_Type','Related_Contact_Company','Priority','Needed_By','Assigned_To','Status','Notes'],
  Surveys: ['Timestamp','Event_Session','Guest_Name','Company','Email','Rating','Best_Part','Referral_Interest','Follow_Up_Requested','Testimonial_Permission','Google_Review_Requested','Notes'],
  Templates: ['Template_ID','Template_Type','Subject','Body','Active'],
  Settings: ['Setting_Key','Setting_Value','Notes']
};

function setupSheet() {
  const book = ss();
  Object.keys(SCHEMA).forEach(function(name) {
    let sh = book.getSheetByName(name);
    if (!sh) sh = book.insertSheet(name);
    sh.clear();
    sh.getRange(1, 1, 1, SCHEMA[name].length).setValues([SCHEMA[name]]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, SCHEMA[name].length).setFontWeight('bold').setBackground('#111111').setFontColor('#FFD100');
    sh.autoResizeColumns(1, SCHEMA[name].length);
  });

  seedSettings();
  seedTemplates();
  return { ok: true, message: 'SMKR Power Partner Platform sheet setup complete', tabs: Object.keys(SCHEMA) };
}

function seedSettings() {
  const rows = [
    ['SHEET_ID', SHEET_ID, 'Power Partner Platform database'],
    ['RSVP_URL', RSVP_URL, 'Power Partners RSVP page'],
    ['DEFAULT_OWNER', 'Brandon Bynum', 'Default platform owner'],
    ['COMPANY_NAME', 'ServiceMaster KWIK Restore', 'Brand name'],
    ['LOCATION', 'Gurnee & Cary, Illinois', 'Primary operating markets'],
    ['TAGLINE', 'Found. Chosen. Remembered.', 'Platform tagline'],
    ['EXPENSE_DEFAULT_SUBMIT_TO', 'Joy', 'Default expense routing'],
    ['OPS_DEFAULT_ASSIGN_TO', 'Dan', 'Default operations routing']
  ];
  sheet('Settings').getRange(2, 1, rows.length, 3).setValues(rows);
}

function seedTemplates() {
  const inviteBody = 'Hi {{First_Name}},\n\nI wanted to personally invite you to Power Partners Weekly at ServiceMaster KWIK Restore in Gurnee. This is a small-format referral and relationship room built for trusted professionals across insurance, real estate, property management, lending, and commercial services.\n\nYou can RSVP here: ' + RSVP_URL + '\n\nBest,\nBrandon Bynum';
  const rows = [
    ['TPL-INVITE-001','Power Partners Invite','Invitation: Power Partners Weekly at ServiceMaster KWIK Restore',inviteBody,'TRUE'],
    ['TPL-FOLLOWUP-001','Post Visit Follow-Up','Great connecting at Power Partners Weekly','Thank you again for joining us. I appreciated the opportunity to learn more about your business and where our referral ecosystems may align.','TRUE']
  ];
  sheet('Templates').getRange(2, 1, rows.length, 5).setValues(rows);
}

function doGet(e) {
  const action = e.parameter.action || 'dashboard';
  if (action === 'setup') return json(setupSheet());
  if (action === 'dashboard') return json(getDashboardMetrics());
  if (action === 'contacts') return json(getRows('Contacts'));
  return json({ ok: true, message: 'SMKR Power Partner API active' });
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const action = payload.action;
  const data = payload.data || {};
  if (action === 'setupSheet') return json(setupSheet());
  if (action === 'addContact') return json(addContact(data));
  if (action === 'logTouchpoint') return json(logTouchpoint(data));
  if (action === 'sendInvite') return json(sendInvite(data));
  if (action === 'logInvite') return json(logInvite(data));
  if (action === 'logOperationsRequest') return json(logOperationsRequest(data));
  if (action === 'logExpense') return json(logExpense(data));
  if (action === 'logSurvey') return json(logSurvey(data));
  return json({ ok: false, error: 'Unknown action', action: action });
}

function ss() { return SpreadsheetApp.openById(SHEET_ID); }
function sheet(name) { return ss().getSheetByName(name); }
function now() { return new Date(); }
function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function appendObject(sheetName, headers, data) { const sh = sheet(sheetName); const row = headers.map(h => data[h] || ''); sh.appendRow(row); return { ok: true, sheet: sheetName, row: sh.getLastRow() }; }
function getRows(sheetName) { const values = sheet(sheetName).getDataRange().getValues(); const headers = values.shift() || []; return values.filter(r => r.join('').length).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]]))); }

function getDashboardMetrics() {
  return { ok: true, contacts: Math.max(sheet('Contacts').getLastRow() - 1, 0), invites: Math.max(sheet('Invite_Log').getLastRow() - 1, 0), rsvps: Math.max(sheet('RSVPs').getLastRow() - 1, 0), touchpoints: Math.max(sheet('Touchpoints').getLastRow() - 1, 0), opsRequests: Math.max(sheet('Operations_Requests').getLastRow() - 1, 0), expenses: Math.max(sheet('Expenses').getLastRow() - 1, 0) };
}

function addContact(data) { data.Contact_ID = data.Contact_ID || 'C-' + Date.now(); data.Created_At = now(); data.Updated_At = now(); return appendObject('Contacts', SCHEMA.Contacts, data); }
function logTouchpoint(data) { data.Timestamp = now(); return appendObject('Touchpoints', SCHEMA.Touchpoints, data); }
function logInvite(data) { data.Timestamp = now(); return appendObject('Invite_Log', SCHEMA.Invite_Log, data); }
function logOperationsRequest(data) { data.Request_ID = data.Request_ID || 'OPS-' + Date.now(); data.Timestamp = now(); return appendObject('Operations_Requests', SCHEMA.Operations_Requests, data); }
function logExpense(data) { data.Timestamp = now(); data.Submitted_To = data.Submitted_To || 'Joy'; data.Approval_Status = data.Approval_Status || 'Submitted'; return appendObject('Expenses', SCHEMA.Expenses, data); }
function logSurvey(data) { data.Timestamp = now(); return appendObject('Surveys', SCHEMA.Surveys, data); }

function sendInvite(data) {
  const email = data.Email || data.email;
  const name = data.Contact_Name || data.First_Name || data.Contact_Company || 'there';
  const owner = data.Owner || 'Brandon Bynum';
  const subject = 'Invitation: Power Partners Weekly at ServiceMaster KWIK Restore';
  const body = 'Hi ' + name + ',\n\nI wanted to personally invite you to Power Partners Weekly at ServiceMaster KWIK Restore in Gurnee. This is a small-format referral and relationship room built for trusted professionals across insurance, real estate, property management, lending, and commercial services.\n\nYou can RSVP here: ' + RSVP_URL + '\n\nBest,\n' + owner;
  let messageId = '';
  if (email) { GmailApp.sendEmail(email, subject, body); messageId = 'sent-' + Date.now(); }
  logInvite({ Contact_ID: data.Contact_ID || '', Contact_Name: name, Email: email || '', Invite_Type: 'Power Partners Weekly', Sent_By: owner, Cluster: data.Cluster || '', Status: email ? 'Sent' : 'Staged', Gmail_Message_ID: messageId, Notes: email ? 'Sent via Apps Script GmailApp' : 'No email provided' });
  return { ok: true, sent: !!email, email: email || '', contact: name };
}

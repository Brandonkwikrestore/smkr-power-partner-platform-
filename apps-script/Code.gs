const SHEET_ID = '1qeOi2XoYc_9GEh_3R70osM4KrO8s_29j_kHhmyoZBtY';
const RSVP_URL = 'https://genuine-flan-635798.netlify.app/';

function doGet(e) {
  const action = e.parameter.action || 'dashboard';
  if (action === 'dashboard') return json(getDashboardMetrics());
  if (action === 'contacts') return json(getRows('Contacts'));
  return json({ ok: true, message: 'SMKR Power Partner API active' });
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const action = payload.action;
  const data = payload.data || {};

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

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function appendObject(sheetName, headers, data) {
  const sh = sheet(sheetName);
  const row = headers.map(h => data[h] || '');
  sh.appendRow(row);
  return { ok: true, sheet: sheetName, row: sh.getLastRow() };
}

function getRows(sheetName) {
  const values = sheet(sheetName).getDataRange().getValues();
  const headers = values.shift() || [];
  return values.filter(r => r.join('').length).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

function getDashboardMetrics() {
  return {
    ok: true,
    contacts: Math.max(sheet('Contacts').getLastRow() - 1, 0),
    invites: Math.max(sheet('Invite_Log').getLastRow() - 1, 0),
    rsvps: Math.max(sheet('RSVPs').getLastRow() - 1, 0),
    touchpoints: Math.max(sheet('Touchpoints').getLastRow() - 1, 0),
    opsRequests: Math.max(sheet('Operations_Requests').getLastRow() - 1, 0),
    expenses: Math.max(sheet('Expenses').getLastRow() - 1, 0)
  };
}

function addContact(data) {
  const headers = ['Contact_ID','First_Name','Last_Name','Company','Title','Vertical','Market','Email','Phone','LinkedIn_URL','Priority','Cluster','Source','Owner','Status','Last_Touch','Next_Follow_Up','Notes','Created_At','Updated_At'];
  data.Contact_ID = data.Contact_ID || 'C-' + Date.now();
  data.Created_At = now();
  data.Updated_At = now();
  return appendObject('Contacts', headers, data);
}

function logTouchpoint(data) {
  const headers = ['Timestamp','BDM','Contact_Company','Vertical','Market','Touchpoint_Type','Qualifying_Touchpoint','Pipeline_Stage','Outcome','Next_Step','Revenue_Opportunity','Notes'];
  data.Timestamp = now();
  return appendObject('Touchpoints', headers, data);
}

function logInvite(data) {
  const headers = ['Timestamp','Contact_ID','Contact_Name','Email','Invite_Type','Sent_By','Cluster','Status','Gmail_Message_ID','Notes'];
  data.Timestamp = now();
  return appendObject('Invite_Log', headers, data);
}

function sendInvite(data) {
  const email = data.Email || data.email;
  const name = data.Contact_Name || data.First_Name || data.Contact_Company || 'there';
  const owner = data.Owner || 'Brandon Bynum';
  const subject = 'Invitation: Power Partners Weekly at ServiceMaster KWIK Restore';
  const body = 'Hi ' + name + ',\n\nI wanted to personally invite you to Power Partners Weekly at ServiceMaster KWIK Restore in Gurnee. This is a small-format referral and relationship room built for trusted professionals across insurance, real estate, property management, lending, and commercial services.\n\nYou can RSVP here: ' + RSVP_URL + '\n\nBest,\n' + owner;

  let messageId = '';
  if (email) {
    GmailApp.sendEmail(email, subject, body);
    messageId = 'sent-' + Date.now();
  }

  logInvite({
    Contact_ID: data.Contact_ID || '',
    Contact_Name: name,
    Email: email || '',
    Invite_Type: 'Power Partners Weekly',
    Sent_By: owner,
    Cluster: data.Cluster || '',
    Status: email ? 'Sent' : 'Staged',
    Gmail_Message_ID: messageId,
    Notes: email ? 'Sent via Apps Script GmailApp' : 'No email provided'
  });

  return { ok: true, sent: !!email, email: email || '', contact: name };
}

function logOperationsRequest(data) {
  const headers = ['Request_ID','Timestamp','Submitted_By','Request_Type','Related_Contact_Company','Priority','Needed_By','Assigned_To','Status','Notes'];
  data.Request_ID = data.Request_ID || 'OPS-' + Date.now();
  data.Timestamp = now();
  return appendObject('Operations_Requests', headers, data);
}

function logExpense(data) {
  const headers = ['Timestamp','BDM','Expense_Date','Vendor','Category','Amount','Business_Purpose','Related_Contact_Event','Receipt_Link','Submitted_To','Approval_Status','Notes'];
  data.Timestamp = now();
  data.Submitted_To = data.Submitted_To || 'Joy';
  data.Approval_Status = data.Approval_Status || 'Submitted';
  return appendObject('Expenses', headers, data);
}

function logSurvey(data) {
  const headers = ['Timestamp','Event_Session','Guest_Name','Company','Email','Rating','Best_Part','Referral_Interest','Follow_Up_Requested','Testimonial_Permission','Google_Review_Requested','Notes'];
  data.Timestamp = now();
  return appendObject('Surveys', headers, data);
}

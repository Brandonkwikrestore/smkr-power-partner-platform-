const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbx51d3bQho0m0t4nkt-J3kNL41pSeva74oQIW7VEp_DOzuGMsxRW0MC7frkqH87Z98Z/exec';

export function getApiStatus() {
  return API_URL ? 'Connected to Google Sheet API' : 'Sheet API Not Connected';
}

export async function apiGet(action) {
  if (!API_URL) return { ok: false, offline: true, action };

  try {
    const response = await fetch(API_URL + '?action=' + encodeURIComponent(action));
    return await response.json();
  } catch (error) {
    return { ok: false, error: error.message, action };
  }
}

export async function apiPost(action, data) {
  if (!API_URL) return { ok: false, offline: true, action, data };

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: action, data: data })
    });
    return { ok: true, action: action };
  } catch (error) {
    return { ok: false, error: error.message, action: action };
  }
}

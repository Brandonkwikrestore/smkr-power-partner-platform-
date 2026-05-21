const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';

export function getApiStatus() {
  return API_URL ? 'Connected' : 'Sheet API Not Connected';
}

export async function apiPost(action, data) {
  if (!API_URL) {
    return { ok: false, offline: true, action, data };
  }

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

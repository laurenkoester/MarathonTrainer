const STRAVA_TOKENS_KEY = 'strava-tokens';

export function getStoredTokens() {
  try {
    return JSON.parse(localStorage.getItem(STRAVA_TOKENS_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveTokens(tokens) {
  localStorage.setItem(STRAVA_TOKENS_KEY, JSON.stringify(tokens));
}

export async function getValidToken() {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  const now = Math.floor(Date.now() / 1000);
  if (tokens.expiresAt > now + 300) {
    return tokens.accessToken;
  }

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
      client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
      refresh_token: tokens.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const newTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athleteId: tokens.athleteId,
  };
  saveTokens(newTokens);
  return newTokens.accessToken;
}

export async function exchangeCodeForTokens(code) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
      client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) throw new Error('Failed to exchange Strava code');

  const data = await res.json();
  const tokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athleteId: data.athlete?.id,
  };
  saveTokens(tokens);
  return tokens;
}

export function getStravaAuthUrl() {
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const redirectUri = `${window.location.origin}${base}/strava/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'activity:read_all',
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export async function getTodayActivities() {
  const token = await getValidToken();
  if (!token) return [];

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const after = Math.floor(todayMidnight.getTime() / 1000);

  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=10`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return [];

  const activities = await res.json();
  return activities.filter(a => a.type === 'Run');
}

export async function getActivitiesInRange(startDate, endDate) {
  const token = await getValidToken();
  if (!token) return [];

  const after = Math.floor(startDate.getTime() / 1000);
  const endExclusive = new Date(endDate);
  endExclusive.setDate(endExclusive.getDate() + 1);
  endExclusive.setHours(0, 0, 0, 0);
  const before = Math.floor(endExclusive.getTime() / 1000);

  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&before=${before}&per_page=50`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function isRunActivity(activity) {
  const type = (activity.type || activity.sport_type || '').toLowerCase();
  return type === 'run';
}

export async function getRunActivitiesInRange(startDate, endDate) {
  const activities = await getActivitiesInRange(startDate, endDate);
  return activities.filter(isRunActivity);
}

export function getActivityDateISO(activity) {
  const raw = activity.start_date_local || activity.start_date;
  const d = new Date(raw);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function groupRunsByDate(activities) {
  const map = {};
  for (const activity of activities) {
    if (!isRunActivity(activity) || !activity.distance) continue;
    const dateStr = getActivityDateISO(activity);
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(activity);
  }
  return map;
}

function formatPaceFromSeconds(paceSecsPerMile) {
  const paceMin = Math.floor(paceSecsPerMile / 60);
  const paceSec = Math.round(paceSecsPerMile % 60).toString().padStart(2, '0');
  return `${paceMin}:${paceSec}`;
}

export function stravaRunsToDayDisplay(runs) {
  if (!runs?.length) return null;

  const totalMeters = runs.reduce((s, r) => s + r.distance, 0);
  const totalTime = runs.reduce((s, r) => s + r.moving_time, 0);
  if (totalMeters <= 0) return null;

  const miles = totalMeters / 1609.344;
  const pace = formatPaceFromSeconds(totalTime / (totalMeters / 1609.344));

  return {
    miles: miles.toFixed(1),
    pace,
    actualWo: runs.length === 1 ? runs[0].name : `${runs.length} runs`,
    stravaName: runs.length === 1 ? runs[0].name : `${runs.length} Strava runs`,
    count: runs.length,
    source: 'strava',
  };
}

export function stravaActivityToLogFields(activity) {
  const meters = activity.distance;
  const miles = (meters / 1609.344).toFixed(2);
  const movingSecs = activity.moving_time;
  const paceSecsPerMile = movingSecs / (meters / 1609.344);
  const paceMin = Math.floor(paceSecsPerMile / 60);
  const paceSec = Math.round(paceSecsPerMile % 60).toString().padStart(2, '0');

  return {
    miles,
    pace: `${paceMin}:${paceSec}`,
    actualWo: activity.name,
    stravaId: activity.id,
    stravaName: activity.name,
  };
}

/**
 * ShuTeam API — centralized service
 * All calls go to /api/ which nginx proxies to crm-backend:8000
 */

const BASE = import.meta.env.VITE_API_BASE ?? '';

// ── Session helpers ───────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('token') ?? '';
export const setToken = (token) => localStorage.setItem('token', token);

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') ?? 'null'); } catch { return null; }
};
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ── Core fetch ────────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  
  // Do not set Content-Type manually if sending FormData (browser needs to set boundary)
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { const j = await res.json(); detail = j.detail || detail; } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = async (data) => {
  const res = await request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) });
  if (res.token) setToken(res.token);
  if (res.user) setUser(res.user);
  return res;
};

export const login = async (data) => {
  const res = await request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(data) });
  if (res.token) setToken(res.token);
  if (res.user) setUser(res.user);
  return res;
};

export const getMe = () => request('/api/v1/auth/me');

export const updateMe = (data) =>
  request('/api/v1/auth/me', { method: 'PATCH', body: JSON.stringify(data) });

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request('/api/v1/auth/me/avatar', { method: 'POST', body: formData });
};

export const uploadMedia = (files) => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  return request('/api/v1/media/upload', { method: 'POST', body: formData });
};

// ── Communities ───────────────────────────────────────────────────────────────
export const getCommunities = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/api/v1/crm/communities${q ? `?${q}` : ''}`);
};

export const getCommunity = (id) =>
  request(`/api/v1/crm/communities/${id}`);

export const getUserCommunities = () =>
  request(`/api/v1/crm/user/communities`);

export const getCommunityMembers = (id) =>
  request(`/api/v1/crm/communities/${id}/members`);

export const joinCommunity = (communityId) =>
  request(
    `/api/v1/crm/communities/join?community_id=${communityId}`,
    { method: 'POST' }
  );

export const getJoinRequests = (communityId) =>
  request(`/api/v1/crm/communities/${communityId}/requests`);

export const approveMembership = (membershipId) =>
  request(`/api/v1/crm/memberships/${membershipId}/approve`, { method: 'POST' });

export const rejectMembership = (membershipId) =>
  request(`/api/v1/crm/memberships/${membershipId}/reject`, { method: 'POST' });

export const createCommunity = (data) =>
  request('/api/v1/crm/communities', { method: 'POST', body: JSON.stringify(data) });

export const updateCommunity = (id, data) => request(`/api/v1/crm/communities/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteCommunity = (id) => request(`/api/v1/crm/communities/${id}`, { method: 'DELETE' });

// ── Meetings ──────────────────────────────────────────────────────────────────
export const getMeetings = (params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  return request(`/api/v1/crm/meetings${q ? `?${q}` : ''}`);
};

export const createMeeting = (data) =>
  request('/api/v1/crm/meetings', { method: 'POST', body: JSON.stringify(data) });

export const participateMeeting = (meetingId) =>
  request(
    `/api/v1/crm/meetings/participate?meeting_id=${meetingId}`,
    { method: 'POST' }
  );

// ── Venues ────────────────────────────────────────────────────────────────────
export const getVenues = () => request('/api/v1/crm/venues');

// ── Wallet ────────────────────────────────────────────────────────────────────
export const getWallet = () =>
  request(`/api/v1/crm/wallet`);

export const getTransactions = () =>
  request(`/api/v1/crm/transactions`);
export const getCommunityStats = (id) =>
  request(`/api/v1/crm/communities/${id}/stats`);

export const getPendingProofs = (id) =>
  request(`/api/v1/crm/communities/${id}/pending-proofs`);

export const approveProof = (id) =>
  request(`/api/v1/crm/goals/approve/${id}`, { method: 'POST' });

export const rejectProof = (id) =>
  request(`/api/v1/crm/goals/reject/${id}`, { method: 'POST' });

export const getCommunityGoals = (id) =>
  request(`/api/v1/crm/communities/${id}/goals`);

export const createGoal = (data) =>
  request('/api/v1/crm/goals', { method: 'POST', body: JSON.stringify(data) });

export const registerGoalProgress = (goalId, { increment = 1, proof_urls = [] }) =>
  request(`/api/v1/crm/goals/${goalId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ increment, proof_urls })
  });

export const getUserBadges = () =>
  request(`/api/v1/crm/user/badges`);

export const checkInParticipant = (meetingId, userPhone) =>
  request(`/api/v1/crm/meetings/check-in?meeting_id=${meetingId}&user_phone=${userPhone}`, { method: 'POST' });

export const getUserPhone = () => getUser()?.phone ?? '';

// ── Gallery ───────────────────────────────────────────────────────────────────
export const getGallery = (communityId) =>
  request(`/api/v1/crm/communities/${communityId}/gallery`);

export const addGalleryItem = (communityId, data) =>
  request(`/api/v1/crm/communities/${communityId}/gallery`, {
    method: 'POST',
    body: JSON.stringify(data)
  });

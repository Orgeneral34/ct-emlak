const API_BASE = '/api';

function getAuthHeader() {
  const token =
    localStorage.getItem('altin_auth_token') ||
    sessionStorage.getItem('altin_session_token') ||
    localStorage.getItem('altin_token') ||
    (localStorage.getItem('altin_active_user_id') ? `altin_token_${localStorage.getItem('altin_active_user_id')}` : '');
  const activeOfficeId = sessionStorage.getItem('ct_active_office_id') || '';
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (activeOfficeId) headers['X-Office-Id'] = activeOfficeId;
  return headers;
}

async function authFetch(url, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };
  return fetch(url, {
    ...options,
    headers
  });
}

export const api = {
  // Users
  getUsers: async () => {
    const res = await authFetch(`${API_BASE}/users`);
    return res.json();
  },
  getUser: async (id) => {
    const res = await authFetch(`${API_BASE}/users/${id}`);
    return res.json();
  },

  // Listings
  getListings: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await authFetch(`${API_BASE}/listings?${query.toString()}`);
    return res.json();
  },
  getListing: async (id) => {
    const res = await authFetch(`${API_BASE}/listings/${id}`);
    return res.json();
  },
  createListing: async (data) => {
    const res = await authFetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateListing: async (id, data) => {
    const res = await authFetch(`${API_BASE}/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteListing: async (id) => {
    const res = await authFetch(`${API_BASE}/listings/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Projects (Site, Bloklu Konut, Arsa Parselasyon, Hobi Bahçesi, Villa)
  getProjects: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await authFetch(`${API_BASE}/projects?${query.toString()}`);
    return res.json();
  },
  getProject: async (id) => {
    const res = await authFetch(`${API_BASE}/projects/${id}`);
    return res.json();
  },
  createProject: async (data) => {
    const res = await authFetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateProject: async (id, data) => {
    const res = await authFetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteProject: async (id) => {
    const res = await authFetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  updateProjectUnit: async (projectId, unitId, data) => {
    const res = await authFetch(`${API_BASE}/projects/${projectId}/units/${unitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // File upload (Photo from camera or file)
  uploadPhoto: async (formData) => {
    const res = await authFetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fotoğraf yüklenemedi.');
    }
    return res.json();
  },

  // Performance & Targets & Deals
  getPerformanceStats: async () => {
    const res = await authFetch(`${API_BASE}/performance/stats`);
    return res.json();
  },
  getWeeklyReport: async () => {
    const res = await authFetch(`${API_BASE}/reports/weekly`);
    return res.json();
  },
  createDeal: async (dealData) => {
    const res = await authFetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });
    return res.json();
  },
  saveTarget: async (targetData) => {
    const res = await authFetch(`${API_BASE}/targets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targetData)
    });
    return res.json();
  },

  // CRM Leads & Customers
  getCrmLeads: async (params = {}) => {
    const query = new URLSearchParams(params);
    const res = await authFetch(`${API_BASE}/crm/leads?${query.toString()}`);
    return res.json();
  },
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams(params);
    const res = await authFetch(`${API_BASE}/crm/leads?${query.toString()}`);
    return res.json();
  },
  createCrmLead: async (leadData) => {
    const res = await authFetch(`${API_BASE}/crm/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return res.json();
  },
  updateCrmLead: async (id, updates) => {
    const res = await authFetch(`${API_BASE}/crm/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  deleteCrmLead: async (id) => {
    const res = await authFetch(`${API_BASE}/crm/leads/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // CRM Activities
  getActivities: async (customerId) => {
    const url = customerId ? `${API_BASE}/crm/activities?customerId=${customerId}` : `${API_BASE}/crm/activities`;
    const res = await authFetch(url);
    return res.json();
  },
  createActivity: async (actData) => {
    const res = await authFetch(`${API_BASE}/crm/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actData)
    });
    return res.json();
  },

  // Smart Match Engine
  matchForCustomer: async (customerId) => {
    const res = await authFetch(`${API_BASE}/crm/match/customer/${customerId}`);
    return res.json();
  },
  matchForListing: async (listingId) => {
    const res = await authFetch(`${API_BASE}/crm/match/listing/${listingId}`);
    return res.json();
  },

  // Authentication
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Giriş başarısız oldu.');
    }
    return res.json();
  },
  getMe: async () => {
    const res = await authFetch(`${API_BASE}/auth/me`);
    return res.json();
  },

  // User Management (Broker Admin Panel)
  createUser: async (userData) => {
    const res = await authFetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Kullanıcı eklenemedi.');
    }
    return res.json();
  },
  updateUser: async (id, updates) => {
    const res = await authFetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Kullanıcı güncellenemedi.');
    }
    return res.json();
  },
  deleteUser: async (id) => {
    const res = await authFetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Kullanıcı silinemedi.');
    }
    return res.json();
  },

  // Active Tenants (Halihazırdaki Kiracılar & Kira Takibi)
  getTenants: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await authFetch(`${API_BASE}/tenants?${query.toString()}`);
    return res.json();
  },
  getTenant: async (id) => {
    const res = await authFetch(`${API_BASE}/tenants/${id}`);
    return res.json();
  },
  createTenant: async (tenantData) => {
    const res = await authFetch(`${API_BASE}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenantData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Kiracı kaydı oluşturulamadı.');
    }
    return res.json();
  },
  updateTenant: async (id, updates) => {
    const res = await authFetch(`${API_BASE}/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Kiracı güncellenemedi.');
    }
    return res.json();
  },
  deleteTenant: async (id) => {
    const res = await authFetch(`${API_BASE}/tenants/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Kiracı kaydı silinemedi.');
    }
    return res.json();
  },

  // Demands (Talepler & Alıcı/Kiracı Arayışları)
  getDemands: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await authFetch(`${API_BASE}/demands?${query.toString()}`);
    return res.json();
  },
  getDemand: async (id) => {
    const res = await authFetch(`${API_BASE}/demands/${id}`);
    return res.json();
  },
  createDemand: async (data) => {
    const res = await authFetch(`${API_BASE}/demands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Talep kaydedilemedi.');
    }
    return res.json();
  },
  updateDemand: async (id, data) => {
    const res = await authFetch(`${API_BASE}/demands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Talep güncellenemedi.');
    }
    return res.json();
  },
  deleteDemand: async (id) => {
    const res = await authFetch(`${API_BASE}/demands/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Talep silinemedi.');
    }
    return res.json();
  },
  getDemandMatches: async (id) => {
    const res = await authFetch(`${API_BASE}/demands/${id}/matches`);
    return res.json();
  },
  getListingDemandMatches: async (id) => {
    const res = await authFetch(`${API_BASE}/listings/${id}/demand-matches`);
    return res.json();
  },
  previewMatch: async (payload) => {
    const res = await authFetch(`${API_BASE}/match-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getNotifications: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await authFetch(`${API_BASE}/notifications?${query.toString()}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.notifications || []);
  },
  markNotificationRead: async (id) => {
    const res = await authFetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT'
    });
    return res.json();
  },
  markAllNotificationsRead: async () => {
    const res = await authFetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT'
    });
    return res.json();
  },
  deleteNotification: async (id) => {
    const res = await authFetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Tasks (Operasyon & Görevler)
  getTasks: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    const res = await authFetch(`${API_BASE}/tasks?${query.toString()}`);
    return res.json();
  },
  createTask: async (data) => {
    const res = await authFetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateTask: async (id, data) => {
    const res = await authFetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteTask: async (id) => {
    const res = await authFetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Contracts (E-Sözleşmeler)
  getContracts: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    const res = await authFetch(`${API_BASE}/contracts?${query.toString()}`);
    return res.json();
  },
  getContract: async (id) => {
    const res = await authFetch(`${API_BASE}/contracts/${id}`);
    return res.json();
  },
  createContract: async (data) => {
    const res = await authFetch(`${API_BASE}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateContract: async (id, data) => {
    const res = await authFetch(`${API_BASE}/contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteContract: async (id) => {
    const res = await authFetch(`${API_BASE}/contracts/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Stories (Dijital Saha)
  getStories: async () => {
    const res = await authFetch(`${API_BASE}/stories`);
    return res.json();
  },
  createStory: async (data) => {
    const res = await authFetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteStory: async (id) => {
    const res = await authFetch(`${API_BASE}/stories/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Settings
  getSettings: async () => {
    const res = await authFetch(`${API_BASE}/settings`);
    return res.json();
  },
  updateSettings: async (data) => {
    const res = await authFetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Multi-Office & Super Admin (CT Emlak SaaS)
  getCurrentOffice: async () => {
    const res = await authFetch(`${API_BASE}/office/current`);
    return res.json();
  },
  getSuperAdminOffices: async () => {
    const res = await authFetch(`${API_BASE}/superadmin/offices`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Ofisler yüklenemedi.');
    }
    return res.json();
  },
  createSuperAdminOffice: async (data) => {
    const res = await authFetch(`${API_BASE}/superadmin/offices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Yeni ofis oluşturulamadı.');
    }
    return res.json();
  },
  updateSuperAdminOffice: async (id, data) => {
    const res = await authFetch(`${API_BASE}/superadmin/offices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Ofis güncellenemedi.');
    }
    return res.json();
  },
  deleteSuperAdminOffice: async (id) => {
    const res = await authFetch(`${API_BASE}/superadmin/offices/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Ofis silinemedi.');
    }
    return res.json();
  },
  getSuperAdminUsers: async (officeId = 'ALL') => {
    const res = await authFetch(`${API_BASE}/superadmin/users?officeId=${encodeURIComponent(officeId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Kullanıcılar yüklenemedi.');
    }
    return res.json();
  }
};

/**
 * API Service connecting the React frontend to the Django REST backend.
 * Uses Vite proxy (/api -> http://127.0.0.1:8000).
 */

const API_BASE = '/api';

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/catalog/categories/`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API: Failed to fetch categories from backend, using fallback:', err);
    return null;
  }
}

export async function fetchProducts(categoryId, params = {}) {
  try {
    const query = new URLSearchParams();
    if (categoryId && categoryId !== 'all') {
      query.append('category', categoryId);
    }
    if (params.brand && params.brand !== 'All') {
      query.append('brand', params.brand);
    }
    if (params.search) {
      query.append('q', params.search);
    }
    if (params.ordering) {
      query.append('ordering', params.ordering);
    }

    const res = await fetch(`${API_BASE}/catalog/products/?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    // Return the array of results
    return data.results || data;
  } catch (err) {
    console.warn(`API: Failed to fetch products for category ${categoryId}:`, err);
    return null;
  }
}

export async function checkCompatibility(partIds) {
  try {
    const res = await fetch(`${API_BASE}/builds/compat-check/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ part_ids: partIds }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API: Failed to run backend compatibility check:', err);
    return null;
  }
}

export async function fetchSavedBuilds() {
  try {
    const res = await fetch(`${API_BASE}/builds/`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.results || data;
  } catch (err) {
    console.warn('API: Failed to fetch saved builds from backend:', err);
    return null;
  }
}

export async function createSavedBuild(name, partsMap) {
  try {
    // 1. Create the build
    const res = await fetch(`${API_BASE}/builds/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const newBuild = await res.json();

    // 2. Add items to the build
    for (const [category, product] of Object.entries(partsMap)) {
      if (product && product.id) {
        await fetch(`${API_BASE}/builds/${newBuild.id}/items/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id }),
        }).catch((e) => console.warn(`Could not add item ${product.id} to build:`, e));
      }
    }

    return newBuild;
  } catch (err) {
    console.warn('API: Failed to create saved build in backend:', err);
    return null;
  }
}

export async function deleteSavedBuild(buildId) {
  try {
    const res = await fetch(`${API_BASE}/builds/${buildId}/`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn(`API: Failed to delete build ${buildId}:`, err);
    return false;
  }
}

/* ==========================================================================
   User Authentication (Django REST + SimpleJWT)
   ========================================================================== */

export function getStoredAuth() {
  try {
    const userStr = localStorage.getItem('pcloom_auth_user');
    const tokenStr = localStorage.getItem('pcloom_auth_token');
    if (userStr && tokenStr) {
      return {
        user: JSON.parse(userStr),
        tokens: JSON.parse(tokenStr)
      };
    }
  } catch (e) {}
  return null;
}

export function storeAuth(user, tokens) {
  try {
    localStorage.setItem('pcloom_auth_user', JSON.stringify(user));
    localStorage.setItem('pcloom_auth_token', JSON.stringify(tokens));
  } catch (e) {}
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem('pcloom_auth_user');
    localStorage.removeItem('pcloom_auth_token');
  } catch (e) {}
}

export async function registerUser({ name, email, password }) {
  const res = await fetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    // Return error message string
    const firstErr = Object.values(data)[0];
    const errMsg = Array.isArray(firstErr) ? firstErr[0] : (typeof firstErr === 'string' ? firstErr : 'Registration failed');
    throw new Error(errMsg);
  }

  if (data.user && data.tokens) {
    storeAuth(data.user, data.tokens);
  }
  return data;
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    const firstErr = Object.values(data)[0];
    const errMsg = Array.isArray(firstErr) ? firstErr[0] : (typeof firstErr === 'string' ? firstErr : 'Login failed');
    throw new Error(errMsg);
  }

  if (data.user && data.tokens) {
    storeAuth(data.user, data.tokens);
  }
  return data;
}

export async function fetchCurrentUser() {
  const auth = getStoredAuth();
  if (!auth?.tokens?.access) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me/`, {
      headers: {
        Authorization: `Bearer ${auth.tokens.access}`
      }
    });
    if (!res.ok) {
      if (res.status === 401) {
        clearStoredAuth();
      }
      return null;
    }
    return await res.json();
  } catch (e) {
    return null;
  }
}


/**
 * Global fetch interceptor to inject the JWT auth token
 * and handle 401 unauthenticated responses cleanly.
 */
export function setupFetchInterceptor() {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    let [resource, config] = args;
    
    // Inject token for all /api/ requests
    if (typeof resource === 'string' && resource.startsWith('/api/')) {
      const token = localStorage.getItem('crm_token');
      if (token) {
        config = config || {};
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
      }
    }
    
    const response = await originalFetch(resource, config);
    
    // Auto-logout on 401 unless we are trying to login or public route
    if (
      response.status === 401 && 
      typeof resource === 'string' && 
      !resource.includes('/auth/login') &&
      !resource.includes('/public/')
    ) {
      localStorage.removeItem('crm_token');
      window.location.href = import.meta.env.BASE_URL + 'login';
    }
    
    return response;
  };
}

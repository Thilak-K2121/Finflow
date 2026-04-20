const baseURL = '/api'; // Assuming you have a proxy setup in Vite/CRA

const customFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('ft_token');
  
  // Set up headers, injecting token if it exists
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${baseURL}${endpoint}`, config);

    // Mimic the response interceptor: Kick out on 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('ft_token');
      localStorage.removeItem('ft_user');
      window.location.href = '/login';
      return Promise.reject(new Error('Unauthorized'));
    }

    // Parse the JSON body
    const data = await response.json();

    // If the status isn't 2xx, reject the promise like Axios does
    if (!response.ok) {
      return Promise.reject({ response: { status: response.status, data } });
    }

    // Return in an object mimicking Axios's { data: ... } structure
    return { data }; 
    
  } catch (error) {
    return Promise.reject(error);
  }
};

// Export an object that perfectly mimics api.get, api.post, etc.
const api = {
  get: (url, config) => customFetch(url, { method: 'GET', ...config }),
  post: (url, body, config) => customFetch(url, { method: 'POST', body: JSON.stringify(body), ...config }),
  put: (url, body, config) => customFetch(url, { method: 'PUT', body: JSON.stringify(body), ...config }),
  delete: (url, config) => customFetch(url, { method: 'DELETE', ...config }),
};

export default api;
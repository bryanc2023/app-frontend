import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Dirección base de la API
    headers: {
        'Content-Type': 'application/json'
    }
});
// Interceptor para añadir el token a cada solicitud
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para manejar respuestas con errores de autenticación
instance.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response.status === 401) {
        // Aquí puedes manejar la redirección al login o refrescar el token
        console.log('No autorizado, redirigiendo al login...');
        // Redireccionar a la página de login
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default instance;
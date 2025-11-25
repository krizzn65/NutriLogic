import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 500) {
            window.location.href = '/500';
        }
        return Promise.reject(error);
    }
);

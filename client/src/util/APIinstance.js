import axios from 'axios';

const axiosApiInstance = axios.create();

axiosApiInstance.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axiosApiInstance.defaults.headers.post['Content-Type'] = 'application/json';

axiosApiInstance.interceptors.request.use(
	config => {
		config.headers.Authorization = `Bearer ${window.localStorage.getItem('token')}`;
		// console.log('Token was added: ', window.localStorage.getItem('token'));

		return config;
	},
	error => {
		return Promise.reject(error);
	},
);

axiosApiInstance.interceptors.response.use(
	config => {
		return config;
	},
	error => {
		// console.log('Error:', error.response);

		if (error.response.status === 401) {
			// console.log('We hit 401, token must not be valid');
			window.location = '/login';
		}
		return Promise.reject(error);
	},
);

axiosApiInstance.interceptors.request.use(
    (config) => {
        config.headers.Authorization = `Bearer ${window.localStorage.getItem(
            "token"
        )}`;
        // console.log('Token was added: ', window.localStorage.getItem('token'));
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
axiosApiInstance.interceptors.response.use(
    (config) => {
        return config;
    },
    (error) => {
        // console.log('Error:', error.response);
        if (error.response.status === 401) {
            // console.log('We hit 401, token must not be valid');
            window.location = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosApiInstance;

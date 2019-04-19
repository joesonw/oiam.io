import {
    URL,
    getToken,
} from './defaults';

export default function handleHttp<T>(path: string, init?: RequestInit): Promise<T> {
    const q = init || {};
    q.headers = q.headers || {};
    q.headers['X-Authorization-Token'] = (getToken() || {}).id;
    // eslint-disable-next-line no-undef
    return fetch(`${URL}${path}`, q)
        .then(res => res.json().then((data) => {
            if (res.status === 200) {
                return Promise.resolve(data.data);
            }
            return Promise.reject(new Error(data.message));
        }));
}

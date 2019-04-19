export default function parseSearch(search: string): {[key: string]: string} {
    const hashes = search.slice(search.indexOf('?') + 1).split('&');
    const params = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const hash of hashes) {
        const [key, val] = hash.split('=');
        params[key] = decodeURIComponent(val);
    }
    return params;
}

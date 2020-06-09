import { useLocation } from 'react-router-dom';

/*
export function getCurrentHash(): string | undefined {
    const { hash } = window.location;
    if (hash) {
        return hash.substr(1);
    }
    return undefined;
}
*/

function getCurrentHash(hash: string | undefined) {
    if (!hash) {
        return undefined;
    }
    return hash.substr(1);
}

function useHash() {
    const location = useLocation();

    return getCurrentHash(location.hash);
}
export default useHash;

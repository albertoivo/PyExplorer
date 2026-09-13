import { useEffect } from 'react';
import { env } from '../../config/env';

export function useDomainRedirect() {
    useEffect(() => {
        if (env.IS_PROD && window.location.hostname.includes('web.app')) {
            window.location.href = env.APP_URL;
        }
    }, []);
}

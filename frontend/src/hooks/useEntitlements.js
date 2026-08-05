import { useState, useEffect, useCallback } from 'react';
import { API } from '../utils/api';

/** Fetch the current user's plan, features, limits and usage from the billing API. */
export function useEntitlements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    return API.get('/api/billing/entitlements')
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, [refresh]);

  const hasFeature = useCallback((f) => Boolean(data?.features?.includes(f)), [data]);
  return { data, loading, hasFeature, refresh };
}

export default useEntitlements;

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForTokens } from '../utils/stravaApi';
import { useStrava } from '../hooks/useStrava';
import PageWrapper from '../components/layout/PageWrapper';

export default function StravaCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useStrava();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = params.get('code');
    if (!code) {
      setError('No authorization code received');
      return;
    }

    exchangeCodeForTokens(code)
      .then(tokens => {
        dispatch({ type: 'SET_TOKENS', tokens });
        navigate('/');
      })
      .catch(err => setError(err.message));
  }, [params, navigate, dispatch]);

  return (
    <PageWrapper>
      <h1 className="font-display text-4xl tracking-widest">Connecting Strava</h1>
      {error ? (
        <p className="mt-4 text-red-500">{error}</p>
      ) : (
        <p className="mt-4 text-muted">Completing authorization…</p>
      )}
    </PageWrapper>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse query parameters from URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        if (!code) {
          throw new Error('No authorization code received from Amazon');
        }

        // Call our edge function to exchange the code for tokens
        const { data, error } = await supabase.functions.invoke('amazon-auth', {
          body: { code, state },
        });

        if (error) {
          throw error;
        }

        // Success! Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'Failed to authenticate with Amazon');
        setProcessing(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-processing">
        <h2>Processing Amazon Authentication</h2>
        <p>Please wait while we complete your authentication...</p>
        {/* Add loading spinner here */}
      </div>
    </div>
  );
};

export default AuthCallback;

import { amazonAuth } from '../services/amazonAuth';
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const ConnectionStatus: React.FC<{ userId: string }> = ({ userId }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on component mount
  React.useEffect(() => {
    checkConnectionStatus();
  }, [userId]);

  const checkConnectionStatus = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const connected = await amazonAuth.checkConnectionStatus(userId);
      setIsConnected(connected);
    } catch (err: any) {
      console.error('Error checking connection status:', err);
      setError('Failed to check connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!userId) return;

    setIsConnecting(true);
    setError(null);

    try {
      const result = await amazonAuth.initiateAuth(userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to connect Amazon account');
      }
      
      // Refresh connection status after successful connection
      await checkConnectionStatus();
    } catch (err: any) {
      console.error('Error connecting Amazon account:', err);
      setError(err.message || 'Failed to connect Amazon account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await amazonAuth.disconnect(userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to disconnect Amazon account');
      }
      
      setIsConnected(false);
    } catch (err: any) {
      console.error('Error disconnecting Amazon account:', err);
      setError(err.message || 'Failed to disconnect Amazon account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshProfiles = async () => {
    if (!userId || !isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await amazonAuth.fetchProfiles(userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh Amazon profiles');
      }
      
      // Show success message or update UI
    } catch (err: any) {
      console.error('Error refreshing Amazon profiles:', err);
      setError(err.message || 'Failed to refresh Amazon profiles');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch campaigns using the new edge function
  const handleFetchCampaigns = async () => {
    if (!userId || !isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-amazon-campaigns', {
        body: { userId },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch Amazon campaigns');
      }
      
      console.log('Campaigns fetched successfully:', data);
      // Show success message or update UI
    } catch (err: any) {
      console.error('Error fetching Amazon campaigns:', err);
      setError(err.message || 'Failed to fetch Amazon campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="connection-status loading">Loading connection status...</div>;
  }

  return (
    <div className="connection-status">
      <h3>Amazon Advertising Connection</h3>
      
      {error && (
        <div className="connection-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      {isConnected ? (
        <div className="connection-connected">
          <p>Your Amazon Advertising account is connected.</p>
          <div className="connection-actions">
            <button onClick={handleRefreshProfiles} disabled={isLoading}>
              Refresh Profiles
            </button>
            <button onClick={handleFetchCampaigns} disabled={isLoading}>
              Fetch Campaigns
            </button>
            <button onClick={handleDisconnect} disabled={isLoading} className="disconnect-button">
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="connection-disconnected">
          <p>Connect your Amazon Advertising account to get started.</p>
          <button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="connect-button"
          >
            {isConnecting ? 'Connecting...' : 'Connect Amazon Ads'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { amazonAuth } from '../../services/amazonAuth';

interface AdvertiserAccount {
  id: string;
  profile_id: string;
  account_name: string;
  marketplace: string;
  account_type: string;
  last_synced: string;
}

export const ConnectionStatus: React.FC = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AdvertiserAccount[]>([]);

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);

  const checkConnectionStatus = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await amazonAuth.checkConnectionStatus(user.id);
      setIsConnected(connected);
      
      if (connected) {
        const accounts = await amazonAuth.getAdvertiserAccounts(user.id);
        setAccounts(accounts);
      }
    } catch (err: any) {
      console.error('Error checking connection status:', err);
      setError('Failed to check connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const result = await amazonAuth.initiateAuth(user.id);
      
      if (result.success) {
        // Wait a moment for the tokens to be processed
        setTimeout(() => {
          checkConnectionStatus();
        }, 2000);
      } else {
        setError(result.error || 'Failed to connect Amazon account');
      }
    } catch (err: any) {
      console.error('Error connecting Amazon account:', err);
      setError('Failed to connect Amazon account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await amazonAuth.disconnect(user.id);
      
      if (result.success) {
        setIsConnected(false);
        setAccounts([]);
      } else {
        setError(result.error || 'Failed to disconnect Amazon account');
      }
    } catch (err: any) {
      console.error('Error disconnecting Amazon account:', err);
      setError('Failed to disconnect Amazon account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshProfiles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await amazonAuth.fetchProfiles(user.id);
      
      if (result.success) {
        // Refresh the accounts list
        const accounts = await amazonAuth.getAdvertiserAccounts(user.id);
        setAccounts(accounts);
      } else {
        setError(result.error || 'Failed to refresh Amazon profiles');
      }
    } catch (err: any) {
      console.error('Error refreshing Amazon profiles:', err);
      setError('Failed to refresh Amazon profiles');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="connection-status loading">
        <h2>Amazon Advertising Connection</h2>
        <p>Loading connection status...</p>
      </div>
    );
  }

  return (
    <div className="connection-status">
      <div className="connection-header">
        <h2>Amazon Advertising Connection</h2>
        <div className={`status-badge ${isConnected ? 'connected' : 'not-connected'}`}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="connection-description">
        <p>
          Connect your Amazon Advertising account to enable API access
          for campaign management, reporting data, and API key generation.
        </p>
      </div>
      
      {isConnected ? (
        <div className="connected-content">
          <div className="account-actions">
            <button 
              onClick={handleRefreshProfiles} 
              disabled={isLoading}
              className="refresh-button"
            >
              Refresh Profiles
            </button>
            <button 
              onClick={handleDisconnect} 
              disabled={isLoading}
              className="disconnect-button"
            >
              Disconnect
            </button>
          </div>
          
          {accounts.length > 0 ? (
            <div className="account-list">
              <h3>Connected Accounts</h3>
              <table>
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Marketplace</th>
                    <th>Account Type</th>
                    <th>Profile ID</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => (
                    <tr key={account.id}>
                      <td>{account.account_name}</td>
                      <td>{account.marketplace.toUpperCase()}</td>
                      <td>{account.account_type}</td>
                      <td>{account.profile_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-accounts">
              <p>No advertising accounts found. Click "Refresh Profiles" to fetch your accounts.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="connection-action">
          <button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="connect-button"
          >
            {isConnecting ? 'Connecting...' : 'Connect Amazon Advertising'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;

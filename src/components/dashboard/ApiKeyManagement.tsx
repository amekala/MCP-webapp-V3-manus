import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiKeyService } from '../../services/apiKeyService';
import { amazonAuth } from '../../services/amazonAuth';

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  created_at: string;
  last_used: string | null;
  is_active: boolean;
  request_count: number;
}

export const ApiKeyManagement: React.FC = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      loadApiKeys();
      checkConnectionStatus();
    }
  }, [user]);

  const checkConnectionStatus = async () => {
    if (!user) return;
    
    try {
      const connected = await amazonAuth.checkConnectionStatus(user.id);
      setIsConnected(connected);
    } catch (err) {
      console.error('Error checking connection status:', err);
    }
  };

  const loadApiKeys = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const keys = await apiKeyService.getApiKeys(user.id);
      setApiKeys(keys);
    } catch (err: any) {
      console.error('Error loading API keys:', err);
      setError('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!newKeyName.trim()) {
      setError('API key name is required');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setNewlyGeneratedKey(null);
    
    try {
      const result = await apiKeyService.generateApiKey(user.id, newKeyName);
      
      if (result.success && result.key) {
        setNewlyGeneratedKey(result.key);
        setNewKeyName('');
        loadApiKeys();
      } else {
        setError(result.error || 'Failed to generate API key');
      }
    } catch (err: any) {
      console.error('Error generating API key:', err);
      setError('Failed to generate API key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiKeyService.revokeApiKey(user.id, keyId);
      
      if (result.success) {
        loadApiKeys();
      } else {
        setError(result.error || 'Failed to revoke API key');
      }
    } catch (err: any) {
      console.error('Error revoking API key:', err);
      setError('Failed to revoke API key');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('API key copied to clipboard');
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
        setError('Failed to copy to clipboard');
      });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading && apiKeys.length === 0) {
    return (
      <div className="api-key-management loading">
        <h2>API Key Management</h2>
        <p>Loading API keys...</p>
      </div>
    );
  }

  return (
    <div className="api-key-management">
      <h2>API Key Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="api-key-description">
        <p>
          Create and manage API keys for developers to access your advertising data.
          API keys allow secure access to your Amazon Advertising accounts through
          the AdsConnect platform.
        </p>
      </div>
      
      {!isConnected ? (
        <div className="not-connected-message">
          <p>
            <strong>Amazon Advertising account not connected.</strong> Please connect your
            Amazon Advertising account before generating API keys.
          </p>
        </div>
      ) : (
        <>
          <div className="generate-key-section">
            <h3>Create a new API key</h3>
            <form onSubmit={handleGenerateKey}>
              <div className="form-group">
                <label htmlFor="keyName">API Key Name</label>
                <input
                  id="keyName"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Development, Production, Analytics"
                  required
                />
              </div>
              
              <button type="submit" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate API Key'}
              </button>
            </form>
          </div>
          
          {newlyGeneratedKey && (
            <div className="new-key-display">
              <h3>Your New API Key</h3>
              <p className="key-warning">
                This key will only be shown once. Please save it securely.
              </p>
              <div className="key-value-container">
                <code>{newlyGeneratedKey}</code>
                <button 
                  onClick={() => copyToClipboard(newlyGeneratedKey)}
                  className="copy-button"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
          
          <div className="api-keys-list">
            <h3>Your API Keys</h3>
            
            {apiKeys.length === 0 ? (
              <p>You haven't generated any API keys yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th>Status</th>
                    <th>Requests</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map(key => (
                    <tr key={key.id} className={key.is_active ? '' : 'revoked'}>
                      <td>{key.name}</td>
                      <td>{formatDate(key.created_at)}</td>
                      <td>{key.last_used ? formatDate(key.last_used) : 'Never'}</td>
                      <td>{key.is_active ? 'Active' : 'Revoked'}</td>
                      <td>{key.request_count}</td>
                      <td>
                        {key.is_active && (
                          <button 
                            onClick={() => handleRevokeKey(key.id)}
                            className="revoke-button"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ApiKeyManagement;

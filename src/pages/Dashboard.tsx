import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import ConnectionStatus from '../components/dashboard/ConnectionStatus';
import ApiKeyManagement from '../components/dashboard/ApiKeyManagement';

export const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to auth page if not authenticated
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="dashboard loading">
          <Container>
            <h1>Loading...</h1>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Header />
      <main className="dashboard">
        <Container>
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p className="welcome-message">
              Welcome back, {user.email}
            </p>
          </div>
          
          <div className="dashboard-grid">
            <section className="dashboard-section">
              <ConnectionStatus />
            </section>
            
            <section className="dashboard-section">
              <ApiKeyManagement />
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;

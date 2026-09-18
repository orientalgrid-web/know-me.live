import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client using Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Navigation Layout Component
function Layout({ children, session }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#1e293b', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>KnowMe Social Network</h2>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
          {session ? (
            <>
              <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>Profile</Link>
              <button 
                onClick={() => supabase.auth.signOut()} 
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" style={{ color: '#fff', textDecoration: 'none' }}>Login / Sign Up</Link>
          )}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <footer style={{ textAlign: 'center', padding: '1rem', background: '#f1f5f9', color: '#64748b' }}>
        © {new Date().getFullYear()} KnowMe Social Network. All rights reserved.
      </footer>
    </div>
  );
}

// Page Components
function Home() {
  return (
    <div>
      <h1>Welcome to KnowMe</h1>
      <p>Connect and share with your network live on know-me.live.</p>
    </div>
  );
}

function Profile({ session }) {
  return (
    <div>
      <h1>User Profile</h1>
      <p>Logged in as: <strong>{session?.user?.email}</strong></p>
    </div>
  );
}

function AuthPage() {
  return (
    <div>
      <h1>Authentication</h1>
      <p>Please log in or sign up to access your profile.</p>
    </div>
  );
}

// Main App Component
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading KnowMe...</div>;
  }

  return (
    <Router>
      <Layout session={session}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/profile" 
            element={session ? <Profile session={session} /> : <Navigate to="/auth" replace />} 
          />
          <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" replace />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}
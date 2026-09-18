import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Navigation Bar & Layout Component
function Layout({ children, session }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ background: '#0f172a', color: '#ffffff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>KnowMe</h2>
        <nav style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: '500' }}>Feed</Link>
          {session ? (
            <>
              <Link to="/profile" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: '500' }}>Profile</Link>
              <button 
                onClick={() => supabase.auth.signOut()} 
                style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '500' }}>Sign In</Link>
          )}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '720px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
      <footer style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
        © {new Date().getFullYear()} KnowMe. All rights reserved.
      </footer>
    </div>
  );
}

// 3. Social Feed Page
function Feed({ session }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !session) return;
    setLoading(true);

    const { error } = await supabase.from('posts').insert([
      { content: newPost, user_email: session.user.email, user_id: session.user.id }
    ]);

    setLoading(false);
    if (!error) {
      setNewPost('');
      fetchPosts();
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Social Feed</h1>
      {session && (
        <form onSubmit={handleCreatePost} style={{ marginBottom: '2rem' }}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            style={{ width: '100%', height: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', fontFamily: 'inherit' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.length === 0 ? (
          <p style={{ color: '#64748b' }}>No posts yet. Be the first to share something!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id || Math.random()} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff' }}>
              <strong style={{ color: '#334155' }}>{post.user_email || 'Anonymous'}</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#0f172a' }}>{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 4. User Profile Page
function Profile({ session }) {
  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>User Profile</h1>
      <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Email:</strong> {session?.user?.email}</p>
        <p style={{ margin: 0 }}><strong>User ID:</strong> {session?.user?.id}</p>
      </div>
    </div>
  );
}

// 5. Authentication Page (Login/Sign Up)
function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');

    const { error } = isSigningUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1 style={{ fontSize: '1.8rem', color: '#0f172a', textAlign: 'center' }}>
        {isSigningUp ? 'Create Account' : 'Sign In'}
      </h1>
      {message && <p style={{ color: '#ef4444', textAlign: 'center' }}>{message}</p>}
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="email" 
          placeholder="Email address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <button 
          type="submit" 
          style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isSigningUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b' }}>
        {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span 
          onClick={() => setIsSigningUp(!isSigningUp)} 
          style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSigningUp ? 'Sign In' : 'Sign Up'}
        </span>
      </p>
    </div>
  );
}

// 6. Main App Component
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
    return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading KnowMe...</div>;
  }

  return (
    <Router>
      <Layout session={session}>
        <Routes>
          <Route path="/" element={<Feed session={session} />} />
          <Route 
            path="/profile" 
            element={session ? <Profile session={session} /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/auth" 
            element={!session ? <AuthPage /> : <Navigate to="/" replace />} 
          />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useGame();

  const [formData, setFormData] = useState({
    username: 'Bhakti',
    email: 'bhakti@scribble.io',
    password: 'password123',
    confirmPassword: 'password123',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter an email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      signup(formData.username, formData.email, formData.password);
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={16} />
            <span>Scribble Royale</span>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join the ultimate multiplayer drawing and guessing arena.</p>
        </div>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <Input
              label="Username"
              name="username"
              placeholder="e.g. Bhakti"
              value={formData.username}
              onChange={handleChange}
              iconLeft={<User size={18} />}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              iconLeft={<Mail size={18} />}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              iconLeft={<Lock size={18} />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              iconLeft={<Lock size={18} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
              icon={<ArrowRight size={18} />}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

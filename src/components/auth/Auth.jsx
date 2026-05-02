import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import './Auth.css';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [msg, setMsg] = useState(null);

  const validate = () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsg("Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 6) {
      setMsg("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // If Supabase returns a session, they are automatically logged in.
        // If no session is returned, email confirmation is still enabled in the Supabase dashboard.
        if (!data.session) {
          setMsg('Successfully signed up! (Note: If you want immediate access without email confirmation, please disable "Confirm email" in your Supabase Auth settings).');
        }
      }
    } catch (error) {
      setMsg(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="auth-wrapper"
      >
        <Card className="auth-card">
          <div className="auth-header">
            <motion.h1 
              className="auth-brand"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              EatWise AI
            </motion.h1>
            <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Sign in to continue your health journey' : 'Start tracking your nutrition intelligently'}
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            {msg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`auth-message ${msg.includes('email') ? 'success' : 'error'}`}
              >
                {msg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                autoFocus
                className="auth-input"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="auth-input"
              />
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={loading} className="w-full mt-4 auth-submit-btn">
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </motion.div>
          </form>
          <div className="auth-switch-container">
            <p className="auth-switch">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button 
                type="button" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMsg(null);
                  setPassword('');
                }} 
                className="switch-btn"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
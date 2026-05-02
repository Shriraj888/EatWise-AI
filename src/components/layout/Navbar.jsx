import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ScanSearch, 
  ChefHat, 
  UserCircle,
  HeartPulse,
  Menu,
  X,
  Moon,
  Sun,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { NAV_LINKS } from '../../utils/constants';
import { supabase } from '../../utils/supabase';
import './Navbar.css';

const ICON_MAP = {
  LayoutDashboard,
  UtensilsCrossed,
  ScanSearch,
  ChefHat,
  HeartPulse,
  UserCircle
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <motion.div 
            className="logo-icon-wrapper"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <Sparkles size={20} className="logo-sparkle" />
          </motion.div>
          <span className="logo-text">EatWise<span className="logo-ai">AI</span></span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="navbar-links desktop-only">
          {NAV_LINKS.map((link) => {
            const Icon = ICON_MAP[link.icon];
            
            return (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: [0, -10, 10, -5, 5, 0] }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </motion.div>
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator" 
                        className="nav-indicator"
                        initial={false}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <motion.button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
            whileTap={{ scale: 0.85, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <motion.button 
            className="logout-button desktop-only" 
            onClick={handleLogout} 
            aria-label="Log out"
            style={{ 
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1, color: 'var(--color-danger, #ef4444)' }}
          >
            <LogOut size={18} />
          </motion.button>
          
          <motion.button 
            className="mobile-menu-btn mobile-only" 
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="mobile-menu overlay"
            initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="mobile-menu-links">
              {NAV_LINKS.map((link, index) => {
                const Icon = ICON_MAP[link.icon];
                
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <NavLink 
                      to={link.path} 
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      <Icon size={20} />
                      <span>{link.label}</span>
                    </NavLink>
                  </motion.div>
                );
              })}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.05, duration: 0.2 }}
                style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}
              >
                <div 
                  className="mobile-nav-link"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  style={{ color: 'var(--color-danger, #ef4444)', cursor: 'pointer' }}
                >
                  <LogOut size={20} />
                  <span>Log Out</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

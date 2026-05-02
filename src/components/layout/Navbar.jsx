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

  const [hoveredPath, setHoveredPath] = useState(null);

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", bounce: 0, duration: 0.8 }}
      onMouseLeave={() => setHoveredPath(null)}
    >
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <motion.span 
            className="logo-text"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            EatWise<span className="logo-ai">AI.</span>
          </motion.span>
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
                onMouseEnter={() => setHoveredPath(link.path)}
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </motion.div>
                    <span>{link.label}</span>
                    
                    {/* Active Underline Indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator" 
                        className="nav-indicator"
                        initial={false}
                        transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
                      />
                    )}
                    
                    {/* Magnetic Hover Background */}
                    {hoveredPath === link.path && !isActive && (
                      <motion.div 
                        layoutId="nav-hover-bg" 
                        className="nav-hover-bg"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
            whileTap={{ scale: 0.85 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0, rotate: -180, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                exit={{ y: 20, opacity: 0, rotate: 180, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <motion.button 
            className="logout-button desktop-only" 
            onClick={handleLogout} 
            aria-label="Log out"
            whileTap={{ scale: 0.85 }}
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

import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useDashboardNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToSection = useCallback((section: string) => {
    navigate(`/dashboard/${section}`);
    // Scroll to top when section changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const getCurrentSection = useCallback(() => {
    const pathSegments = location.pathname.split('/');
    return pathSegments[pathSegments.length - 1] || 'overview';
  }, [location.pathname]);

  const isActiveSection = useCallback((section: string) => {
    return getCurrentSection() === section;
  }, [getCurrentSection]);

  const goToOverview = useCallback(() => {
    navigateToSection('overview');
  }, [navigateToSection]);

  const goToProfile = useCallback(() => {
    navigateToSection('profile');
  }, [navigateToSection]);

  const goToMembership = useCallback(() => {
    navigateToSection('membership');
  }, [navigateToSection]);

  const goToPayment = useCallback(() => {
    navigateToSection('payment');
  }, [navigateToSection]);

  const goToSettings = useCallback(() => {
    navigateToSection('settings');
  }, [navigateToSection]);

  return {
    navigateToSection,
    getCurrentSection,
    isActiveSection,
    goToOverview,
    goToProfile,
    goToMembership,
    goToPayment,
    goToSettings,
    currentPath: location.pathname,
  };
};

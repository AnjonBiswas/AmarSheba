import { Outlet, useLocation } from 'react-router-dom';
import BackToTop from '../components/BackToTop.jsx';
import Disclaimer from '../components/Disclaimer.jsx';
import FloatingChatbot from '../components/FloatingChatbot.jsx';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import PageTransition from '../components/PageTransition.jsx';
import ScrollToTop from '../components/ScrollToTop.jsx';

export default function MainLayout() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <PageTransition routeKey={location.pathname}>
          <Outlet />
        </PageTransition>
        <Disclaimer />
      </main>
      <Footer />
      <BackToTop />
      <FloatingChatbot />
    </>
  );
}

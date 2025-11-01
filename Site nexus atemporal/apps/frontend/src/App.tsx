import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/sections/Hero';
import { Benefits } from './components/sections/Benefits';
import { Plans } from './components/sections/Plans';
import { FAQ } from './components/sections/FAQ';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/Footer';
import { LGPDBanner } from './components/LGPDBanner';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Plans />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <LGPDBanner />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

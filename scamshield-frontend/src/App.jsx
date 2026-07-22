import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import TextScanner from './pages/TextScanner.jsx';
import WhatsAppScanner from './pages/WhatsAppScanner.jsx';
import EmailScanner from './pages/EmailScanner.jsx';
import URLScanner from './pages/URLScanner.jsx';
import ScreenshotScanner from './pages/ScreenshotScanner.jsx';
import Result from './pages/Result.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/scan/text" element={<TextScanner />} />
        <Route path="/scan/whatsapp" element={<WhatsAppScanner />} />
        <Route path="/scan/email" element={<EmailScanner />} />
        <Route path="/scan/url" element={<URLScanner />} />
        <Route path="/scan/screenshot" element={<ScreenshotScanner />} />
        <Route path="/result" element={<Result />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const Home = React.lazy(() => import('./pages/Home'));
const Venues = React.lazy(() => import('./pages/Venues'));
const Profile = React.lazy(() => import('./pages/Profile'));

const PageLoader = () => (
    <div style={{ background: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        Загрузка...
    </div>
);

function App() {
  return (
    <Router>
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/*" element={<Home />} />
                <Route path="/venues" element={<Venues />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    </Router>
  );
}

export default App;

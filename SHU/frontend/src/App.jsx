import React, { lazy, Suspense, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Modal from './components/ui/Modal'
import RequestForm from './components/RequestForm'
import ThankYou from './components/ThankYou'
import LandingSurvey from './components/LandingSurvey'
import ContactDetails from './components/ContactDetails'

const WhyGames = lazy(() => import('./components/WhyGames'))
const Solutions = lazy(() => import('./components/Solutions'))
const Separator = lazy(() => import('./components/Separator'))
const GCA = lazy(() => import('./components/GCA'))
const GameDev = lazy(() => import('./components/GameDev'))
const Phygital = lazy(() => import('./components/Phygital'))
const InnovationLab = lazy(() => import('./components/InnovationLab'))
const AdditionalSolutions = lazy(() => import('./components/AdditionalSolutions'))
const Process = lazy(() => import('./components/Process'))
const Footer = lazy(() => import('./components/Footer'))

import { Routes, Route, useNavigate } from 'react-router-dom'

import './styles/Layout.css'

function App() {
  const navigate = useNavigate();
  // Generate pixels for the transition strip (Multi-row)
  const rows = 8; // Increased rows again for even deeper valley
  const pixelsPerRow = 50; // Increased width coverage

  const pixelGrid = Array.from({ length: rows }).map((_, rowIndex) => {
    return (
      <div key={rowIndex} className="pixel-row">
        {Array.from({ length: pixelsPerRow }).map((_, colIndex) => {

          let isVisible = false;
          let color = '#E86D84'; // Default lighter pink

          // Normalized distance from "valley center"
          // Shift center to the right (0.65) so left side is longer/higher
          const valleyCenter = pixelsPerRow * 0.65;
          const dist = Math.abs(colIndex - valleyCenter) / (pixelsPerRow * 0.6);

          const maxVisibleRows = rows;
          const minVisibleRows = 2; // Floor of the valley

          // Linear V-shape height
          let targetHeight = minVisibleRows + (dist * (maxVisibleRows - minVisibleRows));

          // Add significant random noise to height
          targetHeight += (Math.random() * 3 - 1.5);

          // Calculate threshold row index (row 0 is top)
          const thresholdRow = rows - targetHeight;

          // Main Visibility Logic
          const depthBelowSurface = rowIndex - thresholdRow;

          if (depthBelowSurface > 2) {
            // Deep underground: Solid
            isVisible = true;
          } else if (depthBelowSurface > -1) {
            // Surface layer (3 rows deep): Checkerboard/Dither effect
            // Checkerboard pattern
            if ((rowIndex + colIndex) % 2 === 0) {
              isVisible = true;
            } else if (Math.random() > 0.6) {
              // Random fill
              isVisible = true;
            }

            // Random gaps in surface
            if (isVisible && Math.random() > 0.7) isVisible = false;
          }

          // Floating particles (reduced chance)
          if (!isVisible && depthBelowSurface > -3 && Math.random() > 0.96) {
            isVisible = true;
          }

          // --- SAFE ZONE FOR BUTTON ---
          // We need to keep the center-top area clear
          // Button is roughly in the middle.
          // Row 0-3 are the danger zones for overlapping the button
          const isCenterColumn = colIndex > (pixelsPerRow * 0.35) && colIndex < (pixelsPerRow * 0.65);
          if (rowIndex < 4 && isCenterColumn) {
            isVisible = false;
          }

          // --- EXTRA GAPS ON LEFT ---
          // If column is on the left half, add more random gaps
          if (colIndex < (pixelsPerRow * 0.45) && isVisible) {
            if (Math.random() > 0.6) isVisible = false;
          }

          // Random color variation
          if (isVisible && Math.random() > 0.85) {
            color = '#E34865';
          }

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`pixel-block ${!isVisible ? 'hidden' : ''}`}
              style={isVisible ? { backgroundColor: color } : {}}
            ></div>
          );
        })}
      </div>
    );
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setIsSurveyOpen(false);
    setIsContactsOpen(false);
    navigate('/thanks');
    window.scrollTo(0, 0); // Scroll to top for the new page
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="app-container">
          <Header 
            onOpenSurvey={() => setIsSurveyOpen(true)} 
            onOpenContacts={() => setIsContactsOpen(true)}
          />
          <Hero 
            onOpenModal={() => setIsModalOpen(true)} 
            onOpenSurvey={() => setIsSurveyOpen(true)} 
          />

          <main className="main-content">
            {/* Pixel Transition Strip */}
            <div className="pixel-transition">
              {pixelGrid}
            </div>

            <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }} />}>
              <div className="why-games-wrapper">
                <WhyGames />
              </div>

              <div className="content-bg">
                <Solutions />
                <Separator />
                <GCA />
                <GameDev />
                <AdditionalSolutions />
                <Process />
                <Footer onFormSuccess={handleFormSuccess} />
              </div>
            </Suspense>
          </main>

          {/* Main Request Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="ОСТАВИТЬ ЗАЯВКУ"
          >
            <RequestForm
              inputBg="#1a1a1a"
              inputTextColor="#ffffff"
              labelColor="#666666"
              btnBg="#E66D7A"
              isModal={true}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleFormSuccess}
            />
          </Modal>

          {/* Survey Modal */}
          <Modal
            isOpen={isSurveyOpen}
            onClose={() => setIsSurveyOpen(false)}
            title="НАЧАТЬ ИГРУ"
          >
            <LandingSurvey
              onFinish={handleFormSuccess}
              onOpenCatalog={() => setIsSurveyOpen(false)}
            />
          </Modal>

          {/* Contacts Modal */}
          <Modal
            isOpen={isContactsOpen}
            onClose={() => setIsContactsOpen(false)}
            title="КОНТАКТЫ"
          >
            <ContactDetails />
          </Modal>
        </div>
      } />

      <Route path="/thanks" element={
        <div className="app-container">
          <Header onOpenContacts={() => setIsContactsOpen(true)} />
          <main className="main-content thank-you-page">
            <ThankYou
              onClose={() => navigate('/')}
              isModal={false}
              isFullPage={true}
            />
          </main>
        </div>
      } />
    </Routes>
  )
}

export default App

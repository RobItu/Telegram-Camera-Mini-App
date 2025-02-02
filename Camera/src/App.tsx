import React, { useState, useEffect } from 'react';
import CameraPage from './components/CameraPage';
import PermissionsPage from './components/PermissionsPage';

declare global {
  interface Window {
    Telegram: any;
  }
}

function App() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');

  useEffect(() => {
    // Ensure Telegram WebApp API is available
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Retrieve permissions from Telegram storage
    const cameraGranted = tg.storage.getItem('cameraGranted') === 'true';
    const locationGranted = tg.storage.getItem('locationGranted') === 'true';
    const storedPhase = tg.storage.getItem('selectedPhase') || '';

    if (cameraGranted && locationGranted && storedPhase) {
      setPermissionsGranted(true);
      setCurrentPhase(storedPhase);
    }
  }, []);

  const handlePermissionsGranted = (phase: string) => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Store granted permissions in Telegram storage
    tg.storage.setItem('cameraGranted', 'true');
    tg.storage.setItem('locationGranted', 'true');
    tg.storage.setItem('selectedPhase', phase);

    setCurrentPhase(phase);
    setPermissionsGranted(true);
  };

  return (
    <div>
      {permissionsGranted ? (
        <CameraPage phase={currentPhase} />
      ) : (
        <PermissionsPage onPermissionsGranted={handlePermissionsGranted} />
      )}
    </div>
  );
}

export default App;

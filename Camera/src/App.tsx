import React, { useState, useEffect } from 'react';
import CameraPage from './components/CameraPage';
import PermissionsPage from './components/PermissionsPage';

function App() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');

  useEffect(() => {
    // Check localStorage for persisted permissions
    const cameraGranted = localStorage.getItem('cameraGranted') === 'true';
    const locationGranted = localStorage.getItem('locationGranted') === 'true';
    const storedPhase = localStorage.getItem('selectedPhase') || '';

    if (cameraGranted && locationGranted && storedPhase) {
      setPermissionsGranted(true);
      setCurrentPhase(storedPhase);
    }
  }, []);

  const handlePermissionsGranted = (phase: string) => {
    localStorage.setItem('selectedPhase', phase); // Persist phase
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

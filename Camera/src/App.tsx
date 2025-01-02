import React, { useState } from 'react';
import CameraPage from './components/CameraPage';
import PermissionsPage from './components/PermissionsPage';

function App() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');

  const handlePermissionsGranted = (phase: string) => {
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

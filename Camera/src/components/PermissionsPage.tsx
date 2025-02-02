import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    Telegram: any;
  }
}

interface PermissionsPageProps {
  onPermissionsGranted: (phase: string) => void;
}

const PermissionsPage: React.FC<PermissionsPageProps> = ({ onPermissionsGranted }) => {
  const tg = window.Telegram?.WebApp;
  const [cameraPermission, setCameraPermission] = useState(tg?.storage.getItem('cameraGranted') === 'true');
  const [locationPermission, setLocationPermission] = useState(tg?.storage.getItem('locationGranted') === 'true');
  const [selectedPhase, setSelectedPhase] = useState(tg?.storage.getItem('selectedPhase') || '');

  useEffect(() => {
    if (tg) {
      tg.expand(); // Expand the Mini App to full view
    }
  }, []);

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      tg.storage.setItem('cameraGranted', 'true'); // Persist in Telegram storage
    } catch {
      alert('Camera permission denied');
    }
  };

  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission(true);
          tg.storage.setItem('locationGranted', 'true'); // Persist in Telegram storage
        },
        () => {
          alert('Location permission denied');
        },
      );
    } else {
      alert('Geolocation not supported in this browser');
    }
  };

  const confirmPermissions = () => {
    if (cameraPermission && locationPermission && selectedPhase) {
      onPermissionsGranted(selectedPhase);
    } else {
      alert('Please grant all permissions and select a phase before proceeding.');
    }
  };

  return (
    <div>
      <h1>Permissions Required</h1>
      <button onClick={requestCameraPermission} disabled={cameraPermission}>
        {cameraPermission ? 'Camera Permission Granted' : 'Grant Camera Permission'}
      </button>
      <button onClick={requestLocationPermission} disabled={locationPermission}>
        {locationPermission ? 'Location Permission Granted' : 'Grant Location Permission'}
      </button>
      <select value={selectedPhase} onChange={(e) => setSelectedPhase(e.target.value)}>
        <option value="">Select Phase</option>
        <option value="kitchen">Kitchen</option>
        <option value="driving">Driving</option>
        <option value="delivery_point">Delivery Point</option>
      </select>
      <button onClick={confirmPermissions} disabled={!cameraPermission || !locationPermission || !selectedPhase}>
        Confirm Permissions
      </button>
    </div>
  );
};

export default PermissionsPage;

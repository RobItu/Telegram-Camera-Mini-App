import React, { useState } from 'react';

interface PermissionsPageProps {
  onPermissionsGranted: (phase: string) => void;
}

const PermissionsPage: React.FC<PermissionsPageProps> = ({ onPermissionsGranted }) => {
  const [cameraPermission, setCameraPermission] = useState(localStorage.getItem('cameraGranted') === 'true');
  const [locationPermission, setLocationPermission] = useState(localStorage.getItem('locationGranted') === 'true');
  const [selectedPhase, setSelectedPhase] = useState(localStorage.getItem('selectedPhase') || '');

  const styles = {
    container: {
      maxWidth: '400px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '24px',
      marginBottom: '20px',
    },
    permissionItem: {
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    label: {
      fontSize: '16px',
      marginRight: '10px',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      marginRight: '10px',
    },
    select: {
      width: '100%',
      padding: '8px',
      marginTop: '15px',
      marginBottom: '15px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    buttonDisabled: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
    },
    confirmButton: {
      marginTop: '20px',
      width: '100%',
      padding: '10px',
      backgroundColor: '#28a745',
    },
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      localStorage.setItem('cameraGranted', 'true'); // Persist camera permission
    } catch {
      alert('Camera permission denied');
    }
  };

  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission(true);
          localStorage.setItem('locationGranted', 'true'); // Persist location permission
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
    <div style={styles.container}>
      <h1 style={styles.title}>Permissions Required</h1>

      <div style={styles.permissionItem}>
        <input type="checkbox" checked={cameraPermission} readOnly style={styles.checkbox} />
        <span style={styles.label}>Camera Access</span>
        <button
          onClick={requestCameraPermission}
          style={{
            ...styles.button,
            ...(cameraPermission ? styles.buttonDisabled : {}),
          }}
          disabled={cameraPermission}
        >
          {cameraPermission ? 'Granted' : 'Grant Permission'}
        </button>
      </div>

      <div style={styles.permissionItem}>
        <input type="checkbox" checked={locationPermission} readOnly style={styles.checkbox} />
        <span style={styles.label}>Location Access</span>
        <button
          onClick={requestLocationPermission}
          style={{
            ...styles.button,
            ...(locationPermission ? styles.buttonDisabled : {}),
          }}
          disabled={locationPermission}
        >
          {locationPermission ? 'Granted' : 'Grant Permission'}
        </button>
      </div>

      <select value={selectedPhase} onChange={(e) => setSelectedPhase(e.target.value)} style={styles.select}>
        <option value="">Select Phase</option>
        <option value="kitchen">Kitchen</option>
        <option value="driving">Driving</option>
        <option value="delivery_point">Delivery Point</option>
      </select>

      <button
        onClick={confirmPermissions}
        style={{
          ...styles.button,
          ...styles.confirmButton,
          ...(!cameraPermission || !locationPermission || !selectedPhase ? styles.buttonDisabled : {}),
        }}
        disabled={!cameraPermission || !locationPermission || !selectedPhase}
      >
        Confirm Permissions
      </button>
    </div>
  );
};

export default PermissionsPage;

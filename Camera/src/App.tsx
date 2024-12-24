import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTelegram } from './hooks/useTelegram';
import axios from 'axios';
import { Camera, CameraType } from './Camera';

const Wrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const Control = styled.div`
  position: fixed;
  display: flex;
  right: 0;
  width: 20%;
  min-width: 130px;
  min-height: 130px;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 50px;
  box-sizing: border-box;
  flex-direction: column-reverse;

  @media (max-aspect-ratio: 1/1) {
    flex-direction: row;
    bottom: 0;
    width: 100%;
    height: 20%;
  }

  @media (max-width: 400px) {
    padding: 10px;
  }
`;

const Button = styled.button`
  outline: none;
  color: white;
  opacity: 1;
  background: transparent;
  background-color: transparent;
  background-position-x: 0%;
  background-position-y: 0%;
  background-repeat: repeat;
  background-image: none;
  padding: 0;
  text-shadow: 0px 0px 4px black;
  background-position: center center;
  background-repeat: no-repeat;
  pointer-events: auto;
  cursor: pointer;
  z-index: 2;
  filter: invert(100%);
  border: none;

  &:hover {
    opacity: 0.7;
  }
`;

const TakePhotoButton = styled(Button)`
  background: url('https://img.icons8.com/ios/50/000000/compact-camera.png');
  background-position: center;
  background-size: 50px;
  background-repeat: no-repeat;
  width: 80px;
  height: 80px;
  border: solid 4px black;
  border-radius: 50%;

  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

const TorchButton = styled(Button)`
  background: url('https://img.icons8.com/ios/50/000000/light.png');
  background-position: center;
  background-size: 50px;
  background-repeat: no-repeat;
  width: 80px;
  height: 80px;
  border: solid 4px black;
  border-radius: 50%;

  &.toggled {
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

const ChangeFacingCameraButton = styled(Button)`
  background: url(https://img.icons8.com/ios/50/000000/switch-camera.png);
  background-position: center;
  background-size: 40px;
  background-repeat: no-repeat;
  width: 40px;
  height: 40px;
  padding: 40px;
  &:disabled {
    opacity: 0;
    cursor: default;
    padding: 60px;
  }
  @media (max-width: 400px) {
    padding: 40px 5px;
    &:disabled {
      padding: 40px 25px;
    }
  }
`;

const ImagePreview = styled.div<{ image: string | null }>`
  width: 120px;
  height: 120px;
  ${({ image }) => (image ? `background-image:  url(${image});` : '')}
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  @media (max-width: 400px) {
    width: 50px;
    height: 120px;
  }
`;

const FullScreenImagePreview = styled.div<{ image: string | null }>`
  width: 100%;
  height: 100%;
  z-index: 100;
  position: absolute;
  background-color: black;
  ${({ image }) => (image ? `background-image:  url(${image});` : '')}
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const App = () => {
  const { user } = useTelegram();
  const [askPermission, setaskPermission] = useState<boolean>(false);
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [showImage, setShowImage] = useState<boolean>(false);
  const camera = useRef<CameraType>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [torchToggled, setTorchToggled] = useState<boolean>(false);

  // Get mediaDevices
  useEffect(() => {
    const requestCameraAccess = async () => {
      try {
        const videoDevices = devices.filter((i) => i.kind === 'videoinput');
        setDevices(videoDevices);
        console.log('Camera Granted');
      } catch (err) {
        setError('Camera access denied');
      }
    };
    requestCameraAccess();
  }, [askPermission]);

  // Get Location Tags
  useEffect(() => {
    const getLocation = async () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        return error;
      }

      console.log('Accessing Location...');
      navigator.geolocation.getCurrentPosition((position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(loc);
        setaskPermission(true);
        console.log(`coordinates: ${loc.latitude}, ${loc.longitude} `);
      });
      console.log(`navigator: ${navigator.geolocation}`);
    };

    setTimeout(() => getLocation(), 3000);
  }, []);

  //Function responsible for submitting data to a database, currently for PostgreSQL
  // TODO: Change express point to AWS API point.
  const handleSubmit = async (
    username: string,
    image64URL: string | ImageData,
    locationTags: string,
    timestamp: string,
  ) => {
    try {
      const response = await axios.post('http://localhost:3001/api/saveData', {
        username,
        image64URL,
        locationTags,
        timestamp,
      });
      if (response.data.success) {
        console.log('Data saved successfully');
      } else {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // TODO: Add new component to let users choose which phase they're in

  return (
    <Wrapper>
      {showImage ? (
        <FullScreenImagePreview
          image={image}
          onClick={() => {
            setShowImage(!showImage);
          }}
        />
      ) : (
        <Camera
          ref={camera}
          aspectRatio="cover"
          facingMode="environment"
          numberOfCamerasCallback={(i) => setNumberOfCameras(i)}
          videoSourceDeviceId={activeDeviceId}
          errorMessages={{
            noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
            permissionDenied: 'Permission denied. Please refresh and give camera permission.',
            switchCamera:
              'It is not possible to switch camera to different one because there is only one video device accessible.',
            canvas: 'Canvas is not supported.',
          }}
          videoReadyCallback={() => {
            console.log('Video feed ready.');
          }}
        />
      )}
      <Control>
        <select
          onChange={(event) => {
            setActiveDeviceId(event.target.value);
          }}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
        <ImagePreview
          image={image}
          onClick={() => {
            console.log('Image preview clicked');
            setShowImage(!showImage);
          }}
        />
        <TakePhotoButton
          onClick={() => {
            console.log('Take Photo clicked');
            const coordinates = `${location.latitude}, ${location.longitude}`;
            console.log('lat/long coordinates: ', coordinates);

            if (camera.current) {
              const photo = camera.current.takePhoto();
              const timestamp = new Date().toISOString();
              console.log('timestamp: ', timestamp);
              console.log(photo);
              setImage(photo as string);
              const base64URL = photo;

              const userId = user?.username || 'no username';
              console.log(userId);
              handleSubmit(userId, base64URL, coordinates, timestamp);

              // Send to database.
            }
          }}
        />

        {camera.current?.torchSupported && (
          <TorchButton
            className={torchToggled ? 'toggled' : ''}
            onClick={() => {
              if (camera.current) {
                setTorchToggled(camera.current.toggleTorch());
              }
            }}
          />
        )}
        <ChangeFacingCameraButton
          disabled={numberOfCameras <= 1}
          onClick={() => {
            if (camera.current) {
              const result = camera.current.switchCamera();
              console.log(result);
            }
          }}
        />
      </Control>
    </Wrapper>
  );
};

export default App;

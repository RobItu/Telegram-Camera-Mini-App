import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTelegram } from '../hooks/useTelegram';
import axios from 'axios';
import { Camera, CameraType } from '../Camera';

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

interface CameraPageProps {
  phase: string;
}

const CameraPage: React.FC<CameraPageProps> = ({ phase }) => {
  const { user } = useTelegram();
  const [location, setLocation] = useState<any>(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [showImage, setShowImage] = useState<boolean>(false);
  const camera = useRef<CameraType>(null);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [torchToggled, setTorchToggled] = useState<boolean>(false);

  useEffect(() => {
    const cameraGranted = localStorage.getItem('cameraGranted') === 'true';
    const locationGranted = localStorage.getItem('locationGranted') === 'true';

    if (!cameraGranted || !locationGranted) {
      alert('Permissions missing. Please restart the app.');
    }

    const getLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(loc);
        });
      }
    };

    getLocation();
  }, []);

  /**
   * This function creates a SHA-256 hash of the metadata
   * @param userId UserId obtained from Telegram
   * @param locationTags Coordinates of where image was taken
   * @param timestamp Timestamp of when the image was taken
   * @param image64URL Base64URL encoding of image.
   * @returns Hash of all parameters (metadata)
   */

  const createHash = async (
    userId: string,
    locationTags: string,
    timestamp: string,
    phase: string,
    image64URL: string | ImageData,
  ) => {
    // Combine all parameters into a single string
    const dataToHash = JSON.stringify({
      userId,
      locationTags,
      timestamp,
      phase,
      image64URL,
    });

    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash);

    // Create hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  };

  /*
   * handleSubmit function responsible for submitting metadata information to AWS Lambda
   * AWS Lambda will in turn POST the data to RDS
   */

  const handleSubmit = async (
    userId: string,
    locationTags: string,
    timestamp: string,
    phase: string,
    image64URL: string | ImageData,
    transaction_hash: string,
    metadataHash: string | Promise<void>,
  ) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_AWS_ENDPOINT!,
        {
          userId: userId,
          image64URL: image64URL,
          locationTags: locationTags,
          timestamp: timestamp,
          phase: phase,
          transaction_hash: transaction_hash,
          metadataHash: metadataHash,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.success) {
        console.log('Data saved successfully');
      } else {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  //AWS
  //TODO: Create new table with correct column order.

  //Chainlink Functions
  //TODO: Add Chainlink Functions functionality
  //TODO: CL Functions needs to return tx hash and submit to AWS

  //UI
  //TODO: Add confirmation UI informing user metadata submitted when user takes picture
  //TODO: Confirmation page for customers

  //TODO: Upload to Vercel

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
          {/* {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))} */}
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

              const userId = user?.username || 'reactTestUsername';
              const tx_hash = 'Test blockchain Hash: 0x123456abcdef';

              createHash(userId, coordinates, timestamp, phase, base64URL)
                .then((hash) => {
                  console.log(`Metadata Hash: ${hash}`);
                  handleSubmit(userId, coordinates, timestamp, phase, base64URL, tx_hash, hash);
                })
                .catch((error) => {
                  console.error(error);
                });
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

export default CameraPage;

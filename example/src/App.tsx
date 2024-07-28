import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import EXIF from 'exif-js'; // Import the EXIF library
import piexif from 'piexifjs';
import * as opencage from 'opencage-api-client';

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

interface GPSData {
  [key: number]: any;
}

interface GeocodeResponse {
  status: {
    code: number;
    message: string;
  };
  results: Array<{
    formatted: string;
    components: {
      road?: string;
      [key: string]: any;
    };
    annotations: {
      timezone: {
        name: string;
      };
    };
  }>;
  total_results: number;
}

const App = () => {
  const [askPermission, setaskPermission] = useState<boolean>(false);
  const [formattedLocationData, setFormattedLocationData] = useState<any>(null);
  const [convertCoordinates, setConvertCoordinates] = useState<boolean>(false);
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [showImage, setShowImage] = useState<boolean>(false);
  const camera = useRef<CameraType>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [torchToggled, setTorchToggled] = useState<boolean>(false);

  // Get mediaDevices
  useEffect(() => {
    if (askPermission) {
      const requestCameraAccess = async () => {
        try {
          console.log('Access Camera...');
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((i) => i.kind === 'videoinput');
          setDevices(videoDevices);
          console.log('Camera Granted');
        } catch (err) {
          setError('Camera access denied');
        }
      };
      requestCameraAccess();
    }
  }, []);

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
        setConvertCoordinates(true);
        console.log('location set');
        setaskPermission(true);
      });
    };

    getLocation();
  }, [devices]);

  //Converts coordinates to location (street, country, area, etc.)

  useEffect(() => {
    const coordinatesToLocation = async () => {
      if (convertCoordinates) {
        const query = `${location.latitude}, ${location.longitude}`;

        console.log('accessing geocode...');
        opencage.geocode({ q: query, key: 'c880806970d24a4d95b99d6726f821e3' }).then((data: GeocodeResponse) => {
          console.log('accessesd');

          // console.log(JSON.stringify(data));
          if (data.status.code === 200 && data.results.length > 0) {
            const place = data.results[0];
            setFormattedLocationData(place.formatted);
            console.log(place.formatted);
            console.log(place.components.road);
            console.log(place.annotations.timezone.name);
          } else {
            console.log('status', data.status.message);
            console.log('total_results', data.total_results);
          }
        });
      }
    };
    coordinatesToLocation();
  }, [convertCoordinates]);

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

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
            console.log('Image preview clicked'); // This line adds the console message
            setShowImage(!showImage);
          }}
        />
        <TakePhotoButton
          onClick={() => {
            console.log('Take Photo clicked'); // This line adds the console message
            console.log('lat/long coordinates: ', location);
            if (camera.current) {
              const photo = camera.current.takePhoto();
              console.log(photo);
              setImage(photo as string);
              const base64URL = photo;
              console.log(typeof base64URL);

              if (typeof base64URL === 'string') {
                // Initiating geolocation tags
                const zeroth: { [key: number]: any } = {};
                const exif: { [key: number]: any } = {};
                const gps: GPSData = {};

                // Populating geolocation data

                if (location) {
                  gps[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(location.latitude);
                  gps[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(location.longitude);
                  gps[piexif.GPSIFD.GPSLatitudeRef] = location.latitude >= 0 ? 'N' : 'S';
                  gps[piexif.GPSIFD.GPSLongitudeRef] = location.longitude >= 0 ? 'E' : 'W';

                  //   const latitudeDeg = gps[piexif.GPSIFD.GPSLatitude][0][0];
                  //   const latitudeMin = gps[piexif.GPSIFD.GPSLatitude][1][0];
                  //   const latitudeSec = gps[piexif.GPSIFD.GPSLatitude][2][0];
                  //   const latitudeDirection = gps[piexif.GPSIFD.GPSLatitudeRef];
                  //   const latitudeDeg2 = gps[piexif.GPSIFD.GPSLatitude][0][1];
                  //   const latitudeMin2 = gps[piexif.GPSIFD.GPSLatitude][1][1];
                  //   const latitudeSec2 = gps[piexif.GPSIFD.GPSLatitude][2][1];

                  //   const longitudeDeg = gps[piexif.GPSIFD.GPSLongitude][0][0];
                  //   const longitudeMin = gps[piexif.GPSIFD.GPSLongitude][1][0];
                  //   const longitudeSec = gps[piexif.GPSIFD.GPSLongitude][2][0];
                  //   const longitudeDeg2 = gps[piexif.GPSIFD.GPSLongitude][0][1];
                  //   const longitudeMin2 = gps[piexif.GPSIFD.GPSLongitude][1][1];
                  //   const longitudeSec2 = gps[piexif.GPSIFD.GPSLongitude][2][1];
                  //   const longitudeDirection = gps[piexif.GPSIFD.GPSLongitudeRef];
                }

                const exifObj = { '0th': zeroth, Exif: exif, GPS: gps };
                const exifBytes = piexif.dump(exifObj);

                // Insert EXIF metadata into the Base64 image
                const newBase64 = piexif.insert(exifBytes, base64URL);

                // base64ToArrayBuffer must pass base64URL that has the geolocation tags injected in metadata
                const arrayBuffer = base64ToArrayBuffer(newBase64);

                const initiatingBlob = new Blob([arrayBuffer]);
                const stringBlob = initiatingBlob as unknown as string;

                EXIF.getData(stringBlob, function () {
                  const metadata = EXIF.getAllTags(initiatingBlob);
                  console.log('metadata:');
                  console.log(metadata);
                  setMetadata(metadata); // Update the state with the extracted metadata
                });
              }
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

        <div>
          {image && <img src={image} alt="Taken photo" />}
          {metadata && (
            <div>
              <h3>Metadata</h3>
              <pre>{JSON.stringify(metadata, null, 2)}</pre>
              <p>{formattedLocationData}</p>
            </div>
          )}
        </div>
      </Control>
    </Wrapper>
  );
};

export default App;

export type FacingMode = 'user' | 'environment';
export type AspectRatio = 'cover' | number; // for example 16/9, 4/3, 1/1
export type Stream = MediaStream | null;
export type SetStream = React.Dispatch<React.SetStateAction<Stream>>; // type function that updates based on Stream values (above)
export type SetNumberOfCameras = React.Dispatch<React.SetStateAction<number>>; // type function that updates numbers
export type SetNotSupported = React.Dispatch<React.SetStateAction<boolean>>;
export type SetPermissionDenied = React.Dispatch<React.SetStateAction<boolean>>;
export interface CameraProps {
  //Interface that contains properties regarding the camera
  facingMode?: FacingMode;
  aspectRatio?: AspectRatio;
  numberOfCamerasCallback?(numberOfCameras: number): void;
  videoSourceDeviceId?: string | undefined;
  errorMessages: {
    noCameraAccessible?: string;
    permissionDenied?: string;
    switchCamera?: string;
    canvas?: string;
  };
  videoReadyCallback?(): void;
}

export type CameraType = React.ForwardRefExoticComponent<CameraProps & React.RefAttributes<unknown>> & {
  // Complex type that accepts camera props and refs that allows other parts of the code to interact with the camera, like a button click will snap a picture
  takePhoto(type?: 'base64url' | 'imgData'): string | ImageData;
  switchCamera(): FacingMode;
  getNumberOfCameras(): number;
  toggleTorch(): boolean;
  torchSupported: boolean;
};



// Refs are a type of hook that do not cause the component to re-render.
// You can assign certain elements or components to refs so that you may interact with them directly.
// For example, let's say you have an <input> tag which is an element/component. You can create a ref variable like this:

// const inputRef = useRef<HTMLInputElement>(null); // This creates a ref that can hold an HTMLInputElement. (this is just assigning a type, much like you would a string or number)

// You would then assign the inputRef to the <input> tag like this:
// <input ref={inputRef} />

// Now you can have some function interact with inputRef, which means you can manipulate the <input> tag directly
// without causing a re-render every time a change is made. This is very efficient!
// useEffect(() => {
//   if (inputRef.current) {
//     inputRef.current.focus(); // This focuses the input element when the component mounts.
//   }
// }, []);

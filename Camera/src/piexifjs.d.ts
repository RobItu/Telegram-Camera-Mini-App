declare module 'piexifjs' {
  interface ExifIFD {
    [key: string]: any;
  }

  interface PiexifStatic {
    dump(data: { [key: string]: ExifIFD }): string;
    insert(exif: string, jpeg: string): string;
    remove(jpeg: string): string;
    load(data: string): { [key: string]: ExifIFD };
    GPSHelper: {
      degToDmsRational(deg: number): number[];
      dmsRationalToDeg(dms: number[][], ref: string): number;
    };
    GPSIFD: {
      [key: string]: number;
    };
  }

  const piexif: PiexifStatic;
  export default piexif;
}

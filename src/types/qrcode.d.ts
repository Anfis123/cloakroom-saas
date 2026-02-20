// ✅ FILE: src/types/qrcode.d.ts
declare module "qrcode" {
  export type QRCodeToDataURLOptions = {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  };

  const QRCode: {
    toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
    toDataURL(
      text: string,
      callback: (err: any, url: string) => void
    ): void;
    toDataURL(
      text: string,
      options: QRCodeToDataURLOptions,
      callback: (err: any, url: string) => void
    ): void;
  };

  export default QRCode;
}
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, Check } from 'lucide-react';
import { Button } from './Button';

interface LiveCameraProps {
  onCapture: (base64Image: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzing: boolean;
}

export function LiveCamera({ onCapture, onUpload, isAnalyzing }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      setError("Camera access isn't available. You can upload a photo instead.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopStream();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-[3/4] sm:aspect-[4/3] flex items-center justify-center">
        {error ? (
          <div className="text-center p-6 space-y-4 text-slate-300">
            <Camera className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-sm">{error}</p>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 border-[40px] sm:border-[60px] border-slate-900/40 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-white/50 rounded-[40px]" />
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {!error && !capturedImage && (
          <Button
            variant="primary"
            onClick={handleCapture}
            className="flex-1 rounded-2xl py-3 justify-center"
            leftIcon={<Camera className="w-4 h-4" />}
          >
            Capture Photo
          </Button>
        )}

        {capturedImage && (
          <>
            <Button
              variant="outline"
              onClick={handleRetake}
              disabled={isAnalyzing}
              className="flex-1 rounded-2xl py-3 justify-center"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retake
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={isAnalyzing}
              className="flex-1 rounded-2xl py-3 justify-center"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Use This Photo
            </Button>
          </>
        )}
      </div>

      <div className="text-center pt-2">
        <label className="text-sm font-semibold text-emerald-700 cursor-pointer hover:text-emerald-800 transition flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          Upload From Device
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onUpload}
            disabled={isAnalyzing}
          />
        </label>
      </div>
    </div>
  );
}

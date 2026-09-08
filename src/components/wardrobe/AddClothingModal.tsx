import React, { useState } from 'react';
import { GarmentAnalyzer, ExtractedGarment } from './GarmentAnalyzer';
import { GarmentFormModal } from './GarmentFormModal';

export interface AddClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (item: ExtractedGarment & { price?: number; imageBase64: string }) => Promise<void>;
}

export const AddClothingModal: React.FC<AddClothingModalProps> = ({
  isOpen,
  onClose,
  onSaveItem,
}) => {
  const [step, setStep] = useState<'scan' | 'confirm'>('scan');
  const [extractedData, setExtractedData] = useState<ExtractedGarment | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');

  if (!isOpen) return null;

  const handleAnalysisComplete = (data: ExtractedGarment, image: string) => {
    setExtractedData(data);
    setImageBase64(image);
    setStep('confirm');
  };

  const handleReset = () => {
    setStep('scan');
    setExtractedData(null);
    setImageBase64('');
  };

  const handleCloseAll = () => {
    handleReset();
    onClose();
  };

  return (
    <>
      {step === 'scan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-xl">
            <GarmentAnalyzer
              onAnalysisComplete={handleAnalysisComplete}
              onCancel={handleCloseAll}
            />
          </div>
        </div>
      )}

      {step === 'confirm' && extractedData && (
        <GarmentFormModal
          initialData={extractedData}
          imageBase64={imageBase64}
          onSave={async (finalGarment) => {
            await onSaveItem({ ...finalGarment, imageBase64 });
            handleCloseAll();
          }}
          onClose={handleReset}
        />
      )}
    </>
  );
};

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { Slider } from './slider';
import getCroppedImg from '../../../utils/cropImage';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaChange = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
          <h3>Adjust Image</h3>
          <button onClick={onCancel} className="p-1 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative h-80 w-full bg-black/50">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaChange}
            onZoomChange={onZoomChange}
            classes={{
                containerClassName: "rounded-none"
            }}
          />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <ZoomOut size={16} className="text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="flex-1"
            />
            <ZoomIn size={16} className="text-muted-foreground" />
          </div>

          <div className="flex gap-3">
            <GlassButton variant="secondary" onClick={onCancel} className="flex-1">
              Cancel
            </GlassButton>
            <GlassButton onClick={handleSave} className="flex-1">
              <Check size={18} className="mr-2" />
              Apply
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

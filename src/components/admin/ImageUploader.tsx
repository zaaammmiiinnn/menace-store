'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images = [], onChange, maxImages = 6 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image.`);
          continue;
        }

        // Create local preview blob or presigned URL
        const localBlob = URL.createObjectURL(file);
        newUrls.push(localBlob);
      }

      if (newUrls.length > 0) {
        const updated = [...images, ...newUrls].slice(0, maxImages);
        onChange(updated);
        toast.success(`Uploaded ${newUrls.length} image(s).`);
      }
    } catch {
      toast.error('Image upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed.`);
      return;
    }
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    toast.success('Image URL added.');
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#C6FF00] bg-[#C6FF00]/5'
            : 'border-[#262626] hover:border-[#383838] bg-[#111111]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <UploadCloud className="w-8 h-8 text-[#8A8A8A] mx-auto mb-2" />
        <div className="text-[13px] font-medium text-[#F5F1E8]">
          {isUploading ? 'Uploading to R2 storage...' : 'Drag & drop product images, or click to browse'}
        </div>
        <div className="text-[11px] font-mono text-[#666] mt-1">
          Supports PNG, JPG, WebP up to 10MB (max {maxImages} images)
        </div>
      </div>

      {/* Manual URL Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste external image URL (https://...)"
          className="flex-1 bg-[#121212] border border-[#262626] rounded px-3 py-1.5 text-[12px] text-[#F5F1E8] placeholder-[#555] focus:outline-none focus:border-[#C6FF00]/50"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="h-8 px-3 bg-[#1A1A1A] hover:bg-[#252525] text-[#C6FF00] border border-[#2E2E2E] rounded text-[12px] font-mono transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add URL</span>
        </button>
      </div>

      {/* Thumbnail Gallery Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded border border-[#262626] bg-[#0A0A0A] overflow-hidden"
            >
              {url.startsWith('http') || url.startsWith('blob:') || url.startsWith('/') ? (
                <Image
                  src={url}
                  alt={`Product view ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                  unoptimized={url.startsWith('blob:')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#555]">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-[#0A0A0A]/90 text-[#C6FF00] text-[9px] font-mono px-1 rounded border border-[#C6FF00]/30">
                  COVER
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute top-1 right-1 p-1 bg-black/80 text-[#8A8A8A] hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

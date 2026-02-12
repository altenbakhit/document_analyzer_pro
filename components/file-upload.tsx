"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ onFileSelected, accept = ".pdf,.docx", maxSizeMB = 10 }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setError("");

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
        {!selectedFile ? (
          <label className="cursor-pointer flex flex-col items-center space-y-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
            <span className="text-xs text-gray-400">PDF or DOCX (max {maxSizeMB}MB)</span>
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
              <span className="text-xs text-gray-400">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, ImageIcon, X } from 'lucide-react';

export default function UploadBox({ onFileSelect, file, onClear, accept = 'image/*' }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback((files) => {
    if (files && files[0]) onFileSelect(files[0]);
  }, [onFileSelect]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (file) {
    return (
      <div className="glass-card p-4 relative">
        <button
          onClick={onClear}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-bg/80 border border-line flex items-center justify-center text-muted hover:text-white hover:border-danger/40 transition-colors"
        >
          <X size={15} />
        </button>
        <div className="rounded-xl overflow-hidden border border-line bg-black/30 flex items-center justify-center max-h-80">
          <img src={file.preview} alt="Upload preview" className="max-h-80 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted font-mono">
          <ImageIcon size={13} className="text-accent" />
          <span className="truncate">{file.name}</span>
          <span className="ml-auto">{file.size}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      whileHover={{ scale: 1.005 }}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors duration-200
        ${dragging ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/40 hover:bg-white/[0.02]'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="h-14 w-14 rounded-2xl bg-accent-soft flex items-center justify-center">
        <UploadCloud size={26} className="text-accent" />
      </div>
      <div>
        <p className="font-medium text-white/90">Drag & drop a screenshot here</p>
        <p className="text-sm text-muted mt-1">or click to browse — PNG, JPG up to 10MB</p>
      </div>
    </motion.div>
  );
}

"use client";

import { FileInputButtonProps } from "./types";

const FileInputButton = ({ onChange, label, multiple }: FileInputButtonProps) => (
  <div className="relative">
    <input 
      type="file" 
      onChange={onChange} 
      multiple={multiple}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      accept="image/jpeg,image/png,image/webp,image/gif"
    />
    <button 
      type="button" 
      className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white text-gray-700"
    >
      {label}
    </button>
  </div>
);

export default FileInputButton;

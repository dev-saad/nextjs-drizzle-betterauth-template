"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"; // Ensure this path matches where you saved the hook
import { cn } from "@/lib/utils";
import { LucideIcon, Plus, TriangleAlert, User2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export interface AvatarUploadProps {
 maxSize?: number;
 className?: string;
 onFileChange?: (file: File | null) => void;
 defaultAvatar?: string;
 AvatarIcon?: LucideIcon;
 value?: string | File | null;
 onRemove?: () => void;
 required?: boolean;
 disabled?: boolean;
}

export default function AvatarUpload({
 maxSize = 2 * 1024 * 1024, // 2MB
 className,
 onFileChange,
 defaultAvatar,
 AvatarIcon = User2,
 value,
 onRemove,
 required,
 disabled,
}: AvatarUploadProps) {
 const [
  { files, isDragging, errors },
  {
   removeFile,
   handleDragEnter,
   handleDragLeave,
   handleDragOver,
   handleDrop,
   openFileDialog,
   getInputProps,
  },
 ] = useFileUpload({
  maxFiles: 1,
  maxSize,
  accept: "image/*",
  multiple: false,
  onFilesChange: (files) => {
   // Pass the raw File object to the parent form
   onFileChange?.(files[0]?.file instanceof File ? files[0].file : null);
  },
 });

 const currentFile = files[0];

 // Determine the preview URL:
 // 1. New file upload (hook state)
 // 2. Existing value (string URL)
 // 3. Existing value (File object)
 // 4. Default avatar
 const previewUrl =
  currentFile?.preview ||
  (typeof value === "string" && value
   ? value
   : value instanceof File
     ? URL.createObjectURL(value)
     : defaultAvatar);

 const handleRemove = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  // If we have a local file in the hook, remove it
  if (currentFile) {
   removeFile(currentFile.id);
  }

  // Tell parent to clear value
  onRemove?.();
  onFileChange?.(null);
 };

 const handleContainerClick = () => {
  if (!disabled) openFileDialog();
 };

 return (
  <div className={cn("flex flex-col items-center gap-4", className)}>
   {/* Avatar Container */}
   <div className="relative group/avatar">
    <div
     className={cn(
      "relative h-24 w-24 overflow-hidden rounded-full border border-dashed transition-colors flex items-center justify-center bg-background",
      isDragging
       ? "border-primary bg-primary/5"
       : "border-muted-foreground/25 hover:border-muted-foreground/20",
      previewUrl && "border-solid border-border",
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
     )}
     onDragEnter={!disabled ? handleDragEnter : undefined}
     onDragLeave={!disabled ? handleDragLeave : undefined}
     onDragOver={!disabled ? handleDragOver : undefined}
     onDrop={!disabled ? handleDrop : undefined}
     onClick={handleContainerClick}>
     {/* Hidden Input managed by hook */}
     <input {...getInputProps({ disabled })} className="sr-only" />

     {previewUrl ? (
      <Avatar className="h-full w-full">
       <AvatarImage className="object-contain" src={previewUrl} />
       <AvatarFallback>
        <AvatarIcon />
       </AvatarFallback>
      </Avatar>
     ) : (
      <div className="flex flex-col gap-1 h-full w-full items-center justify-center p-2">
       <AvatarIcon />
       <div className="text-center space-y-0.5">
        <p className="text-[10px] text-muted-foreground text-center leading-tight">
         Upload up to {formatBytes(maxSize, 0)}
        </p>
       </div>
      </div>
     )}
    </div>

    {/* Action Button (Plus or X) */}
    {!disabled &&
     (currentFile || (value && !required) ? (
      <Button
       size="icon"
       variant="outline"
       onClick={handleRemove}
       className="cursor-pointer size-6 absolute end-0 top-0 rounded-full z-10 shadow-sm"
       aria-label="Remove avatar"
       type="button">
       <X className="size-3.5" />
      </Button>
     ) : (
      <Button
       size="icon"
       variant="outline"
       onClick={openFileDialog}
       className="cursor-pointer size-6 absolute end-0 top-0 rounded-full z-10 shadow-sm"
       aria-label="Upload avatar"
       type="button">
       <Plus className="size-3.5" />
      </Button>
     ))}
   </div>

   {/* Error Messages */}
   {errors.length > 0 && (
    <Alert variant="destructive" className="max-w-[300px]">
     <TriangleAlert className="h-4 w-4" />
     <AlertTitle>Upload Error</AlertTitle>
     <AlertDescription>
      {errors.map((error, index) => (
       <p key={index} className="text-xs">
        {error}
       </p>
      ))}
     </AlertDescription>
    </Alert>
   )}
  </div>
 );
}

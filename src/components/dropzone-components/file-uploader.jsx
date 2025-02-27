"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import Dropzone from "react-dropzone";
import { toast } from "sonner";

import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

function FileUploader({
  value,
  onValueChange,
  onUpload,
  progresses,
  accept = { "image/*": [] },
  maxSize = 1024 * 1024 * 2,
  maxFileCount = 1,
  multiple = false,
  disabled = false,
  className,
  ...dropzoneProps
}) {
  const [files, setFiles] = useState(value || []);

  useEffect(() => {
    if (value !== undefined) {
      setFiles(value);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if (files.length + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`);
        return;
      }

      const newFiles = acceptedFiles.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onValueChange?.(updatedFiles);

      rejectedFiles.forEach(({ file }) => {
        toast.error(`File ${file.name} was rejected`);
      });

      if (onUpload && updatedFiles.length > 0 && updatedFiles.length <= maxFileCount) {
        toast.promise(onUpload(updatedFiles), {
          loading: `Uploading ${updatedFiles.length} file(s)...`,
          success: () => {
            setFiles([]);
            return `${updatedFiles.length} file(s) uploaded`;
          },
          error: "Failed to upload files",
        });
      }
    },
    [files, maxFileCount, multiple, onUpload, onValueChange]
  );

  function onRemove(index) {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const isDisabled = disabled || files.length >= maxFileCount;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFileCount}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}
        {...dropzoneProps}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isDragActive && "border-muted-foreground/50",
              isDisabled && "pointer-events-none opacity-60",
              className
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
              <div className="rounded-full border border-dashed p-3">
                <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="font-medium text-muted-foreground">
                {isDragActive ? "Drop the files here" : "Drag 'n' drop files here, or click to select files"}
              </p>
            </div>
          </div>
        )}
      </Dropzone>
      {files.length > 0 && (
        <ScrollArea className="h-fit w-full px-3">
          <div className="flex max-h-48 flex-col gap-4">
            {files.map((file, index) => (
              <FileCard key={index} file={file} onRemove={() => onRemove(index)} progress={progresses?.[file.name]} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function FileCard({ file, onRemove, progress }) {
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        {file.preview && <Image src={file.preview} alt={file.name} width={40} height={40} className="rounded-md" />}
        <div className="flex w-full flex-col gap-2">
          <p className="line-clamp-1 text-sm font-medium text-foreground/80">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          {progress !== undefined && <Progress value={progress} />}
        </div>
      </div>
      <Button type="button" variant="outline" size="icon" className="size-7" onClick={onRemove}>
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  );
}

export default FileUploader;

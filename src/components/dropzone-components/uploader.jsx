import { useUploadFile } from "@/hooks/use-upload-file"
// import { UploadedFilesCard } from "./uploaded-files-card"
import FileUploader from "./file-uploader"


export function BasicUploaderDemo() {
  const { onUpload, progresses, uploadedFiles, isUploading } = useUploadFile(
    "imageUploader",
    {
      defaultUploadedFiles: [],
    }
  )

  return (
    <div className="flex flex-col gap-6">
      <FileUploader
        maxFileCount={4}
        maxSize={4 * 1024 * 1024}
        progresses={progresses}
        onUpload={onUpload}
        disabled={isUploading}
      />
    </div>
  )
}

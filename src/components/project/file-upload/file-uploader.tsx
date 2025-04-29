"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileText, Upload, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { UploadedFile, FileStatus } from "@/types/project-types"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  uploadedFiles: UploadedFile[]
  onFileUpload: (files: UploadedFile[]) => void
  onRemoveFile: (fileId: string) => void
}

export function FileUploader({ uploadedFiles, onFileUpload, onRemoveFile }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList: FileList) => {
    setUploadError(null)
    const files = Array.from(fileList)

    // Validate file types
    const validFileTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ]
    const invalidFiles = files.filter((file) => !validFileTypes.includes(file.type))

    if (invalidFiles.length > 0) {
      setUploadError("Only Excel and CSV files are allowed")
      return
    }

    // Process valid files
    const newFiles: UploadedFile[] = files.map((file) => {
      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // In a real app, you would upload the file to your server here
      // For this example, we'll simulate the upload process

      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading",
        file,
        sheets: [], // We'll populate this later when we parse the file
      }
    })

    // Add new files to the list
    const updatedFiles = [...uploadedFiles, ...newFiles]
    onFileUpload(updatedFiles)

    // Simulate file upload progress
    newFiles.forEach((file) => {
      simulateFileUpload(file, updatedFiles, onFileUpload)
    })
  }

  const simulateFileUpload = (
    file: UploadedFile,
    allFiles: UploadedFile[],
    updateCallback: (files: UploadedFile[]) => void,
  ) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        // Simulate reading sheets from Excel files
        setTimeout(() => {
          const updatedFiles = allFiles.map((f) => {
            if (f.id === file.id) {
              // For Excel files, simulate extracting sheet names
              let sheets: string[] = []
              if (f.type.includes("sheet") || f.type.includes("excel")) {
                // Mock sheet names
                sheets = ["Sheet1", "Sheet2", "Sheet3"].map((name) => `${name} (${f.name.split(".")[0]})`)
              } else if (f.type === "text/csv") {
                // CSVs typically have just one sheet
                sheets = [`Data (${f.name.split(".")[0]})`]
              }

              return {
                ...f,
                status: "completed" as FileStatus,
                progress: 100,
                sheets,
              }
            }
            return f
          })

          updateCallback(updatedFiles)
        }, 500)
      }

      const updatedFiles = allFiles.map((f) => {
        if (f.id === file.id) {
          return { ...f, progress }
        }
        return f
      })

      updateCallback(updatedFiles)
    }, 200)
  }

  const handleRemoveFile = (fileId: string) => {
    onRemoveFile(fileId)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed  rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          "hover:border-green-800/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
          accept=".xlsx,.xls,.csv"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="bg-green-800/5 p-4 rounded-full">
            <FileText className=" text-green-900 size-8" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here or <span className="text-amber-800/60">browse</span></p>
          <p className="text-xs text-muted-foreground">Supported formats: .xlsx, .xls, .csv</p>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className=" rounded-md p-2 bg-green-700/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-900" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFile(file.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-2">
                  <Progress value={file.progress} className="h-2 " />
                  <p className="text-xs text-right mt-1 text-muted-foreground">
                    {file.status === "uploading" ? `Uploading: ${file.progress}%` : "Uploaded"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

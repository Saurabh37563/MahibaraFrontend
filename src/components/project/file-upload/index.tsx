"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileUploader } from "./file-uploader"
import { SheetMapper } from "./sheet-mapper"
import { formSchema, type FormValues } from "@/types/project-types"
import type { UploadedFile, StandardSheet } from "@/types/project-types"
import { Upload } from "lucide-react"
import { MdOutlineFileDownload } from "react-icons/md"
import { IoMdAdd } from "react-icons/io"

export function FileUploadMapping() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mappings: [],
    },
  })


  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files)
  }

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))

    // Also remove this file from any mappings
    const currentMappings = form.getValues().mappings
    const updatedMappings = currentMappings.map((mapping) => {
      if (mapping.fileId === fileId) {
        return { ...mapping, fileId: "", sheetName: "" }
      }
      return mapping
    })

    form.setValue("mappings", updatedMappings)
  }

  const nextStep = () => {
    if (uploadedFiles.length === 0) {
      form.setError("root", {
        type: "manual",
        message: "Please upload at least one file before proceeding",
      })
      return
    }

    form.clearErrors("root")
    setStep(2)
  }

  const prevStep = () => {
    setStep(1)
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)

    try {
      // Filter out any mappings that don't have both file and sheet selected
      const validMappings = data.mappings.filter((mapping) => mapping.fileId && mapping.sheetName)
 
      // In a real app, this would be an API call
      // await fetch('/api/submit-mappings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ mappings: validMappings })
      // })

      console.log("Submitted mappings:", validMappings)

      // Reset form and go back to step 1
      form.reset()
      setUploadedFiles([])
      setStep(1)
      setIsOpen(false)

      // Show success message (in a real app, you'd use a toast or notification)
      alert("Mappings submitted successfully!")
    } catch (error) {
      console.error("Error submitting mappings:", error)
      form.setError("root", {
        type: "manual",
        message: "Failed to submit mappings. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset form when closing the modal
      form.reset()
      setUploadedFiles([])
      setStep(1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant={'ghost'}>
         <IoMdAdd className="text-muted-foreground cursor-pointer" size={16} />
        </Button>
      </DialogTrigger>
      
      
      <DialogContent className="sm:max-w-3xl max-h-dvh px-0">
          <DialogHeader className="border-b pb-2 px-2">
            <DialogTitle>{step === 1 ? "Upload Files" : "Map Sheets"}</DialogTitle>
          </DialogHeader>
        <Card className="w-full border-0  px-0  shadow-none">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                {form.formState.errors.root && (
                  <div className="text-sm font-medium text-destructive ">{form.formState.errors.root.message}</div>
                )}

                {step === 1 ? (
                  <FileUploader
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={handleRemoveFile}
                  />
                ) : (
                  <SheetMapper form={form} />
                )}
              </CardContent>

             
            </form>
          </Form>
        </Card>

        <DialogFooter className="flex px-2 justify-between">
                {step === 1 ? (
                  <div className="flex justify-end w-full">
                    <Button type="button" onClick={nextStep} className="bg-green-900 hover:bg-green-800" disabled={uploadedFiles.length === 0}>
                      Process
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                    <Button type="submit" className="bg-green-900 hover:bg-green-800"  disabled={isLoading}>
                      {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                  </>
                )}
              </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FileUploadMapping

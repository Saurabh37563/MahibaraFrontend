import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { IoMdAdd } from 'react-icons/io'
import { Button } from '../ui/button'
import {useForm, SubmitHandler, Controller} from 'react-hook-form'
import { Label } from '../ui/label'
import {  ProjectSchema, ProjectType } from '@/types/project-types'
import {zodResolver} from "@hookform/resolvers/zod"
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
const CreateProjectModal = () => {
  const form= useForm<ProjectType>({
    resolver:zodResolver(ProjectSchema),
    defaultValues:{
        projectName : '',
        projectDescription:""
    }
  })

  const onSubmit = (values:z.infer<typeof ProjectSchema>) => {
    console.log("Form Values : ", values)
  }
  return (
    <Dialog>
        <DialogTrigger> 
        <div
  className="flex gap-1 bg-green-900 hover:bg-green-800 w-fit rounded-lg items-center px-3 py-1.5 cursor-pointer text-sm text-gray-200 hover:text-gray-300 transition-colors"
>
  <IoMdAdd size={18} />
  <span>Create New</span>
</div>

        </DialogTrigger>
        <DialogContent >
            {/* Header */}
            <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                    Fill in the details below to set up your new project. 
                    </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={(form.handleSubmit(onSubmit))} className='space-y-4'>
                   <FormField
                    control={form.control}
                    name="projectName"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Please Enter Project Name' {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Project Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder='Please Enter Project Description' {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </form>

            </Form>
            {/* Footer */}
            <DialogFooter>
                <Button variant={"outline"}>
                    Cancel
                </Button>
                <Button className="flex gap-1 bg-green-900 hover:bg-green-800">
                    <IoMdAdd size={18}  />
                    Create New
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

  )
}

export default CreateProjectModal
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TeamMemberSelector } from "./team-member-select"
import { useMediaQuery } from "@/hooks/use-media-query"

// Team member with permission type
export type TeamMemberWithPermission = {
  id: string
  name: string
  email: string
  position: string
  avatarUrl: string | null | undefined
  permission: "view" | "edit"
}

// Form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  members: z.array(
    z.object({
      id: z.string(),
      permission: z.enum(["view", "edit"])
    })
  ).min(1, {
    message: "Please select at least one team member.",
  }),
})

export default function CreateTeam() {
  const [open, setOpen] = React.useState(false)
  const [selectedMembers, setSelectedMembers] = React.useState<TeamMemberWithPermission[]>([])
  const isDesktop = useMediaQuery("(min-width: 640px)")

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
    },
  })

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({
      ...values,
      members: selectedMembers.map(member => ({ 
        id: member.id, 
        name: member.name, 
        email: member.email,
        position: member.position,
        permission: member.permission 
      })),
    })
    // Here you would typically send the data to your API

    // Reset form and close modal
    form.reset()
    setSelectedMembers([])
    setOpen(false)
  }

  // Update form when selected members change
  const handleMembersChange = (members: TeamMemberWithPermission[]) => {
    setSelectedMembers(members)
    form.setValue(
      "members", 
      members.map(member => ({ 
        id: member.id, 
        permission: member.permission 
      })), 
      { shouldValidate: true }
    )
  }

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedMembers([])
    }
  }, [open, form])

  const FormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter team name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter team description" className="resize-none min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="members"
          render={() => (
            <FormItem className="overflow-hidden">
              <FormLabel>Team Members</FormLabel>
              <FormControl>
                <TeamMemberSelector 
                  selectedMembers={selectedMembers} 
                  onMembersChange={handleMembersChange} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isDesktop ? (
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-900 hover:bg-green-800">Create Team</Button>
          </DialogFooter>
        ) : (
          <DrawerFooter className="pt-2">
            <Button type="submit" className="bg-green-900 hover:bg-green-800">Create Team</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </form>
    </Form>
  )

  // Use Dialog for desktop and Drawer for mobile
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Plus className="size-3" />
            <span className="sr-only">Create Team</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Create a new team and add members to collaborate with.</DialogDescription>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {FormContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Plus className="size-3" />
          <span className="sr-only">Create Team</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-4">
        <DrawerHeader>
          <DrawerTitle>Create New Team</DrawerTitle>
          <DrawerDescription>Create a new team and add members to collaborate with.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto max-h-[65vh] pb-2">
          {FormContent}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
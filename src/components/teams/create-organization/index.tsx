"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCreateOrganization } from "@/queries/organization-query";
export type FormValues = {
  name: string;
  description?: string;
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

export default function CreateOrganization() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const createOrganization = useCreateOrganization();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: FormValues) {
    createOrganization.mutate(
      {
        name: values.name,
        description: values.description,
        owner_id: 10, // Hardcoded ID
      },
      {
        onSuccess: () => {
          form.reset({
            name: "",
            description: "",
          });
          setOpen(false);
        },
      }
    );
  }

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [open, form]);

  const FormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter organization name" {...field} />
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
                <Textarea
                  placeholder="Enter Organization description"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isDesktop ? (
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-900 hover:bg-green-800"
              disabled={createOrganization.isPending}
            >
              {createOrganization.isPending
                ? "Creating..."
                : "Create Organization"}
            </Button>
          </DialogFooter>
        ) : (
          <DrawerFooter className="pt-2">
            <Button
              type="submit"
              className="bg-green-900 hover:bg-green-800"
              disabled={createOrganization.isPending}
            >
              {createOrganization.isPending
                ? "Creating..."
                : "Create Organization"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </form>
    </Form>
  );

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative w-full text-gray-600 flex justify-start p-2"
            >
              <Plus className="size-5 border p-[2px] border-gray-800 rounded-sm" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Create a new organization and add members to collaborate with.
              </DialogDescription>
            </DialogHeader>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            {FormContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative w-full text-gray-600 flex justify-start p-2"
            >
              <Plus className="size-5 border p-[2px] border-gray-800 rounded-sm" />
              Create Organization
            </Button>
          </DrawerTrigger>
          <DrawerContent className="px-4">
            <DrawerHeader>
              <DrawerTitle>Create New Organization</DrawerTitle>
              <DrawerDescription>
                Create a new Organization and add members to collaborate with.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 overflow-y-auto max-h-[65vh] pb-2">
              {FormContent}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

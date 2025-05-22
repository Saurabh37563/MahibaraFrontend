import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IoMdAdd } from "react-icons/io";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import {
  ProjectSchema,
  ProjectType,
  mapFormToApiRequest,
} from "@/types/project-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useTeamContext } from "@/contexts/team-context";
import { useCreateProject } from "@/queries/project-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateProjectModal = () => {
  const [open, setOpen] = useState(false);
  const { activeTeam } = useTeamContext();
  const createProjectMutation = useCreateProject();

  const form = useForm<ProjectType>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      projectName: "",
      projectDescription: "",
      status: "pending",
    },
  });

  const onSubmit = async (values: ProjectType) => {
    if (!activeTeam?.id) {
      toast.error("No active team selected");
      return;
    }

    try {
      await createProjectMutation.mutateAsync(
        mapFormToApiRequest(values, activeTeam.id)
      );

      toast.success("Project created successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-1 bg-green-900 hover:bg-green-800 w-fit rounded-lg items-center px-3 py-1.5 cursor-pointer text-sm text-gray-200 hover:text-gray-300 transition-colors">
          <IoMdAdd size={18} />
          <span>Create New</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to set up your new project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Please Enter Project Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please Enter Project Description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex gap-1 bg-green-900 hover:bg-green-800"
                disabled={createProjectMutation.isPending}
              >
                <IoMdAdd size={18} />
                {createProjectMutation.isPending ? "Creating..." : "Create New"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;

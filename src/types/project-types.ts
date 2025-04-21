import {z} from 'zod';


export const ProjectSchema = z.object({
    projectName:z.string().min(4).max(50),
    projectDescription:z.string().min(10).max(100),
})

export type ProjectType = z.infer<typeof ProjectSchema>
import { z } from 'zod'

// Team Schema:
export const TeamSchema = z.object({
  teamName: z.string().min(3, 'Team name must be at least 3 characters'),
  teamMembers: z
    .array(
      z.object({
        teamMemberId: z.string(),
      })
    )
    .min(1, 'At least one team member is required'),
})
export const TeamMemberSchema = z.object({
    id : z.string(),
    name:z.string(),
    email:z.string().email(),
    position:z.string(),
    avatarUrl:z.string()
  })
  export type TeamMemberType = z.infer<typeof TeamMemberSchema>
export type TeamFormValues = z.infer<typeof TeamSchema>

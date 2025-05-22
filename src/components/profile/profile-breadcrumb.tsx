"use client"
import { useEffect, useState } from "react"
import { ChevronLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { FiHome } from "react-icons/fi"

interface ProfileBreadcrumbProps {
  activeTab: string
}

export const ProfileBreadcrumb = ({ activeTab }: ProfileBreadcrumbProps) => {
  const router = useRouter()
  const [previousUrl, setPreviousUrl] = useState<string>("/")

  useEffect(() => {
    const prevUrl = localStorage.getItem("previousUrl") || "/functions"
    setPreviousUrl(prevUrl)
 
    return () => {
      if (window.location.pathname !== prevUrl) {
        localStorage.setItem("previousUrl", window.location.pathname)
      }
    }
  }, [])

  return (
    <div className="mb-4 flex">
      <Breadcrumb>
        <BreadcrumbList>
       
        <BreadcrumbItem>
          <BreadcrumbLink className="flex items-center gap-2" href="/functions"><FiHome/>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{activeTab === "profile" ? "Profile" : "Security"}</BreadcrumbPage>
        </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

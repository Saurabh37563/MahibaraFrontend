"use client"
import { useState } from "react"
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { 
  HelpCircle, 
  FileText, 
  Phone, 
  Mail, 
  Book, 
  Search, 
  MessageSquare, 
  Video, 
  Home,
  AlertCircle,
  FileQuestion,
  ChevronRight
} from "lucide-react"

// FAQ data
const faqData = [
  {
    id: "faq-1",
    question: "What is MAB Auditing Tool?",
    answer: "MAB is a comprehensive auditing tool designed for organizations to monitor, assess, and audit child organizations or subsidiaries. It provides powerful insights, compliance tracking, and standardized auditing procedures to ensure consistent oversight across organizational hierarchies."
  },
  {
    id: "faq-2",
    question: "How do I set up a new audit for a child organization?",
    answer: "To set up a new audit, navigate to the Dashboard and click \"New Audit\" in the top right corner. Select the child organization from the dropdown menu, choose your audit template or create a custom one, set the audit timeframe, and assign auditors. Once configured, click \"Initiate Audit\" to begin the process."
  },
  {
    id: "faq-3",
    question: "Can I customize audit templates for different types of organizations?",
    answer: "Yes, MAB allows complete customization of audit templates. Go to \"Settings\" → \"Audit Templates\" to either modify existing templates or create new ones from scratch. You can tailor questions, compliance requirements, and scoring metrics based on organizational type, industry, or specific compliance needs."
  },
  {
    id: "faq-4",
    question: "How are permissions managed for auditors vs. administrators?",
    answer: "MAB features a robust role-based access control system. Administrators have full access to create audits, manage users, and view all reports. Auditors can only access assigned audits and submit findings. Organization managers can view results for their organization. Custom roles can be configured in \"Settings\" → \"User Management\" → \"Roles\"."
  },
  {
    id: "faq-5",
    question: "How do I export audit reports?",
    answer: "To export audit reports, navigate to the \"Reports\" section, select the completed audit, and click \"Export\" in the top right corner. You can choose from PDF, Excel, or CSV formats. Custom export templates can be configured to include specific sections or metrics based on your reporting needs."
  },
  {
    id: "faq-6",
    question: "What compliance frameworks does MAB support?",
    answer: "MAB supports major compliance frameworks including ISO 27001, SOC 2, GDPR, HIPAA, and more. Our library of pre-built templates aligns with these frameworks, and you can map custom controls to specific compliance requirements. For custom frameworks, use our template builder to create tailored audit processes."
  }
];

// Documentation data
const documentationData = [
  {
    id: "doc-1",
    title: "Getting Started Guide",
    description: "Learn the basics of setting up MAB, creating your first audit, and understanding key features.",
    icon: Book,
    buttonText: "Read guide"
  },
  {
    id: "doc-2",
    title: "User Manual",
    description: "Detailed documentation covering all features, functions, and capabilities of the MAB platform.",
    icon: FileText,
    buttonText: "View manual"
  },
  {
    id: "doc-3",
    title: "Troubleshooting",
    description: "Solutions to common issues, error messages, and technical problems you might encounter.",
    icon: AlertCircle,
    buttonText: "View solutions"
  },
  {
    id: "doc-4",
    title: "API Documentation",
    description: "Technical references, endpoints, and integration guides for developers and system administrators.",
    icon: FileText,
    buttonText: "View API docs"
  }
];

// Contact information data
const contactMethodsData = [
  {
    id: "contact-1",
    method: "Email Support",
    value: "support@mab-auditing.com",
    details: "Response time: Within 24 hours",
    icon: Mail
  },
  {
    id: "contact-2",
    method: "Phone Support",
    value: "+1 (800) 123-4567",
    details: "Hours: Mon-Fri, 9am-5pm EST",
    icon: Phone
  },
  {
    id: "contact-3",
    method: "Live Chat",
    value: "Available in your dashboard",
    details: "Hours: 24/7 for Premium Support",
    icon: MessageSquare
  }
];

// Training videos data
const trainingVideosData = [
  {
    id: "training-1",
    title: "Getting Started with MAB",
    description: "Overview of the platform, navigation, and core features. Perfect for new users.",
    duration: "15 mins"
  },
  {
    id: "training-2",
    title: "Creating Effective Audit Templates",
    description: "Learn how to create comprehensive audit templates tailored to your organization's needs.",
    duration: "25 mins"
  },
  {
    id: "training-3",
    title: "Advanced Reporting Techniques",
    description: "Master the reporting capabilities to extract valuable insights from your audit data.",
    duration: "30 mins"
  }
];

// Upcoming webinars data
const upcomingWebinarsData = [
  {
    id: "webinar-1",
    title: "New Features in MAB 2023 Q3 Update",
    date: "July 15, 2023",
    time: "11:00 AM EST"
  },
  {
    id: "webinar-2",
    title: "Compliance Management Best Practices",
    date: "July 22, 2023",
    time: "2:00 PM EST"
  }
];

// Tabs data
const tabsData = [
  {
    id: "faqs",
    label: "FAQs",
    icon: HelpCircle
  },
  {
    id: "documentation",
    label: "Documentation",
    icon: FileText
  },
  {
    id: "contact",
    label: "Contact Us",
    icon: Phone
  },
  {
    id: "tutorial",
    label: "Tutorial",
    icon: Video
  }
];

export const HelpAndSupportPage = () => {
  const [activeTab, setActiveTab] = useState("faqs")
  const [searchQuery, setSearchQuery] = useState("")

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="mx-auto  p-4 md:p-8 animate-fade-in">
      <div className="w-full mx-auto">
        {/* Breadcrumbs - UI improvement */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center">
                <Home className="h-4 w-4 mr-1" /> Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Help & Support</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{activeTab}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-950 mb-2">Help & Support Center</h1>
          <p className="text-slate-600">
            Find answers, resources, and support to help you get the most out of MAB Auditing Tool
          </p>
        </div>

        {/* Search Bar - UI improvement */}
        <div className="relative mb-8">
          <Input 
            type="text"
            placeholder="Search for help topics..."
            className="pl-10 pr-4 py-2 border-slate-200 focus:border-emerald-500 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>

        {/* Main Content Tabs */}
        <Tabs 
          defaultValue="faqs" 
          className="w-full"
          onValueChange={handleTabChange}
        >
        <div className="w-full overflow-x-auto">
                  <TabsList className="flex w-full max-sm:w-max overflow-hidden h-14">
                  {tabsData.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id} className="rounded-md">
                      <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
        </div>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="mt-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-950 to-emerald-800 p-4 text-white rounded-t-lg">
                <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-emerald-100">
                  Find answers to the most common questions about MAB Auditing Tool
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map(faq => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-green-900 hover:text-emerald-700">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              
              <CardFooter className="bg-slate-50 py-4 rounded-b-lg border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center">
                  <FileQuestion className="h-5 w-5 text-emerald-700 mr-2" />
                  <span className="text-slate-600">Can't find what you're looking for? </span>
                  <Button variant="link" className="text-emerald-700 p-0 ml-1">
                    View all FAQs
                  </Button>
                </div>
                <Button variant="outline" className="border-emerald-600 text-emerald-700 hidden md:flex">
                  <HelpCircle className="h-4 w-4 mr-2" /> Submit a question
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="mt-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-950 to-emerald-800 p-4 text-white rounded-t-lg">
                <CardTitle className="text-xl">Documentation & Resources</CardTitle>
                <CardDescription className="text-emerald-100">
                  Comprehensive guides, API documentation, and best practices
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentationData.map(doc => (
                    <Card key={doc.id} className="border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center text-green-900">
                          <doc.icon className="h-5 w-5 mr-2 text-emerald-600" /> {doc.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 text-sm">{doc.description}</p>
                      </CardContent>
                      <CardFooter className="border-t border-slate-100 pt-2">
                        <Button variant="ghost" className="text-emerald-700 p-0 flex items-center">
                          {doc.buttonText} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {/* Popular Topics - UI Improvement */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-green-900 mb-4">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Audit Templates", "Compliance Scoring", "User Permissions", "Report Generation", "API Integration", "Data Export"].map((topic, index) => (
                      <Button key={index} variant="outline" size="sm" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Us Tab */}
          <TabsContent value="contact" className="mt-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-950 to-emerald-800 p-4 text-white rounded-t-lg">
                <CardTitle className="text-xl">Contact Support</CardTitle>
                <CardDescription className="text-emerald-100">
                  Get help from our dedicated support team
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-green-900 mb-4">Send us a message</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium text-slate-700">Your Name</label>
                          <Input id="name" placeholder="Enter your name" className="border-slate-200" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                          <Input id="email" type="email" placeholder="your.email@company.com" className="border-slate-200" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject</label>
                        <Input id="subject" placeholder="What is your inquiry about?" className="border-slate-200" />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-slate-700">Message</label>
                        <Textarea 
                          id="message"
                          placeholder="Please describe your issue in detail..." 
                          className="border-slate-200 min-h-[120px]"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Button className="bg-green-950 hover:bg-green-900 text-white">
                          <MessageSquare className="h-4 w-4 mr-2" /> Submit Request
                        </Button>
                        <p className="text-sm text-slate-500">We typically respond within 24 hours</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                    <h3 className="text-lg font-medium text-green-900 mb-4">Alternative ways to reach us</h3>
                    
                    <div className="space-y-6">
                      {contactMethodsData.map(method => (
                        <div key={method.id} className="flex items-start">
                          <method.icon className="h-5 w-5 text-emerald-700 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-slate-800">{method.method}</h4>
                            <p className="text-slate-600 text-sm">{method.value}</p>
                            <p className="text-slate-500 text-xs mt-1">{method.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="tutorial" className="mt-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-950 to-emerald-800 p-4 text-white rounded-t-lg">
                <CardTitle className="text-xl"> Tutorials</CardTitle>
                <CardDescription className="text-emerald-100">
                  Learn how to use MAB effectively with our training resources
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trainingVideosData.map(video => (
                    <Card key={video.id} className="border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group">
                      <div className="aspect-video bg-slate-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                        <Video className="h-10 w-10 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-emerald-900 opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="scale-0 group-hover:scale-100 transition-transform">Watch Now</Button>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-green-900">{video.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-slate-600 text-sm">{video.description}</p>
                      </CardContent>
                      <CardFooter className="border-t border-slate-100 pt-2 flex justify-between items-center">
                        <p className="text-xs text-slate-500">Duration: {video.duration}</p>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-emerald-700">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
               
                
                
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default HelpAndSupportPage

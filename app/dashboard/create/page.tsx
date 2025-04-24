"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, BookOpen, FileText, Upload, Check, Loader2, RefreshCw, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { TestPreview } from "@/components/test-preview"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { initSocket, getSocket, emitEvent, onEvent, GENERATE_TEST_EVENTS, ONLINE_TEST_EVENTS } from "@/lib/socket"

// Interface for the payload expected by the backend - matches TestParamsDto
interface TestParamsDto {
  subject: string
  gradeLevel: string
  title?: string
  description?: string
  sectionTypes?: string[]
  questionsPerSection?: number
  tags?: string[]
  sectionCount?: number
  topic?: string
}

// Form schema updated to match TestParamsDto
const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  sectionTypes: z.array(z.string()).min(1, "At least one section type is required"),
  questionsPerSection: z.number().min(1).max(50),
  tags: z.array(z.string()).optional(),
  sectionCount: z.number().min(1).max(10).optional(),
  topic: z.string().optional(),
})

// Section type options
const sectionTypeOptions = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True/False" },
  { value: "short-answer", label: "Short Answer" },
  { value: "essay", label: "Essay" },
  { value: "matching", label: "Matching" },
  { value: "fill-in-blank", label: "Fill in the Blank" },
]

// Grade level options
const gradeLevelOptions = [
  { value: "elementary", label: "Elementary School" },
  { value: "middle", label: "Middle School" },
  { value: "high", label: "High School" },
  { value: "college", label: "College" },
  { value: "graduate", label: "Graduate" },
  { value: "professional", label: "Professional" },
]

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<"form" | "book">("form")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingProgress, setGeneratingProgress] = useState(0)
  const [extractedTopics, setExtractedTopics] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(true) // Start with true for better UX
  const [error, setError] = useState<string | null>(null)
  const [testData, setTestData] = useState<any>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const socketInitializedRef = useRef(false)
  const [newTag, setNewTag] = useState("")

  // Initialize form with default values matching TestParamsDto
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      gradeLevel: "high",
      title: "",
      description: "",
      sectionTypes: ["multiple-choice"],
      questionsPerSection: 5,
      tags: [],
      sectionCount: 1,
      topic: "",
    },
  })

  // Simulate progress for better UX
  const simulateProgress = useCallback(() => {
    // Clear any existing timeout
    if (progressIntervalRef.current) {
      clearTimeout(progressIntervalRef.current)
    }

    setGeneratingProgress(0) // Start from 0

    // Create a more natural progression curve
    const totalSteps = 20 // More steps for smoother animation
    const maxProgress = 95 // Only go up to 95% until complete
    let currentStep = 0

    const updateProgress = () => {
      currentStep++

      // Calculate progress with a slight randomization and non-linear curve
      // This creates a more natural feeling progress that slows down as it approaches the end
      const progressPercentage = Math.min(
        maxProgress,
        Math.floor((currentStep / totalSteps) * maxProgress) + (Math.random() * 2 - 1), // Add slight randomness (-1 to +1)
      )

      setGeneratingProgress(progressPercentage)

      // Continue updating until we reach near the maximum
      if (currentStep < totalSteps) {
        // Gradually increase the interval time for later steps to simulate slowing down
        const nextInterval = 100 + currentStep * 25
        progressIntervalRef.current = setTimeout(updateProgress, nextInterval)
      }
    }

    // Start the progress updates
    progressIntervalRef.current = setTimeout(updateProgress, 100)
  }, [])

  // Clear progress interval
  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  // Initialize socket connection
  useEffect(() => {
    if (socketInitializedRef.current) return

    // Initialize socket
    const socketInstance = initSocket()

    // Set up event handlers
    const handleConnect = () => {
      console.log("Socket connected successfully")
      setIsConnected(true)
      setError(null)
    }

    const handleDisconnect = () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    }

    const handleError = (err: any) => {
      console.error("Socket connection error:", err)
      setError(err.message || "Connection error")
      setIsConnected(false)
    }

    if (socketInstance) {
      socketInstance.on("connect", handleConnect)
      socketInstance.on("disconnect", handleDisconnect)
      socketInstance.on("connect_error", handleError)

      // Check initial connection state immediately
      if ("connected" in socketInstance) {
        setIsConnected(socketInstance.connected)
      } else {
        // Assume connected for mock sockets
        setIsConnected(true)
      }

      // Double-check connection status after a short delay
      setTimeout(() => {
        if ("connected" in socketInstance) {
          setIsConnected(socketInstance.connected)
        } else {
          // Assume connected for mock sockets
          setIsConnected(true)
        }
      }, 1000)
    }

    socketInitializedRef.current = true

    return () => {
      const socket = getSocket()
      if (socket) {
        socket.off("connect", handleConnect)
        socket.off("disconnect", handleDisconnect)
        socket.off("connect_error", handleError)
      }
    }
  }, [])

  // Set up test event handlers
  useEffect(() => {
    // Handle test creation completion
    const createdCleanup = onEvent(GENERATE_TEST_EVENTS.GENERATE_TEST_SUCCESS, (data) => {
      console.log("Test created:", data)

      // Clear progress interval
      clearProgressInterval()

      // Set progress to 100% before completing
      setGeneratingProgress(100)

      // Update state with a slight delay to show 100% completion
      setTimeout(() => {
        setTestData(data)
        setIsGenerating(false)

        // Move to preview step
        setStep(3)
      }, 800)
    })

    const startTest = onEvent(ONLINE_TEST_EVENTS.START_TEST, (data) => {
      console.log("Test started event received:", data)
      const testId = data?.test_id || data?.test?.id || data?.id

      if (testId) {
        console.log(`Navigating to monitoring page for test ID: ${testId}`)
        // Navigate to the monitoring page with the test ID
        window.location.href = `/dashboard/monitor?testId=${testId}&tempCode=${data?.tempCode.code}`
      } else {
        console.error("Test ID not found in START_TEST event data:", data)
      }
    })

    // Handle errors
    const errorCleanup = onEvent(GENERATE_TEST_EVENTS.GENERATE_TEST_ERROR, (err) => {
      console.error("Server error:", err)
      setError(err.message || "Server error")
      setIsGenerating(false)
      clearProgressInterval()
    })

    return () => {
      createdCleanup()
      errorCleanup()
      clearProgressInterval()
      startTest()
    }
  }, [generatingProgress, clearProgressInterval])

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      const fileType = droppedFile.type

      // Check if file is PDF, DOCX, or TXT
      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "text/plain"
      ) {
        setFile(droppedFile)
      } else {
        alert("Please upload a PDF, DOCX, or TXT file")
      }
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // Process book - optimized with smoother progress
  const processBook = () => {
    if (!file) return

    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate processing with smoother progress updates
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2 // Random increment between 2-10

      if (progress >= 100) {
        clearInterval(interval)
        setProcessingProgress(100)

        setTimeout(() => {
          setIsProcessing(false)

          // Mock extracted topics
          const mockTopics = [
            "Linear Equations",
            "Quadratic Equations",
            "Polynomials",
            "Factoring",
            "Rational Expressions",
            "Radicals",
            "Complex Numbers",
            "Functions",
          ]
          setExtractedTopics(mockTopics)
        }, 500)
      } else {
        setProcessingProgress(progress)
      }
    }, 300)
  }

  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic))
    } else {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  // Add a new tag
  const addTag = () => {
    if (newTag.trim() && !form.getValues().tags?.includes(newTag.trim())) {
      const currentTags = form.getValues().tags || []
      form.setValue("tags", [...currentTags, newTag.trim()])
      setNewTag("")
    }
  }

  // Remove a tag
  const removeTag = (tag: string) => {
    const currentTags = form.getValues().tags || []
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
    )
  }

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (method === "form") {
      handleGenerate(values)
    } else {
      handleGenerateFromBook(values)
    }
  }

  // Generate test from form
  const handleGenerate = async (values: z.infer<typeof formSchema>) => {
    const socket = getSocket()

    if (!socket) {
      setError("Not connected to server")
      return
    }

    setIsGenerating(true)
    setGeneratingProgress(0)

    // Start progress simulation
    simulateProgress()

    // Create payload according to the TestParamsDto interface
    const payload: TestParamsDto = {
      subject: values.subject,
      gradeLevel: values.gradeLevel,
      title: values.title,
      description: values.description,
      sectionTypes: values.sectionTypes,
      questionsPerSection: values.questionsPerSection,
      tags: values.tags,
      sectionCount: values.sectionCount,
      topic: method === "form" ? values.topic : selectedTopics.join(", "),
    }

    // Emit event to create test by form
    emitEvent(GENERATE_TEST_EVENTS.GENERATE_TEST_BY_FORM, payload)
  }

  // Generate test from book
  const handleGenerateFromBook = async (values: z.infer<typeof formSchema>) => {
    const socket = getSocket()

    if (!socket) {
      setError("Not connected to server")
      return
    }

    if (!file || selectedTopics.length === 0) {
      alert("Please upload a file and select at least one topic")
      return
    }

    setIsGenerating(true)
    setGeneratingProgress(0)

    // Start progress simulation
    simulateProgress()

    // Create payload according to the TestParamsDto interface
    const payload: TestParamsDto = {
      subject: values.subject,
      gradeLevel: values.gradeLevel,
      title: values.title,
      description: `${values.description || ""} Book: ${file.name}`,
      sectionTypes: values.sectionTypes,
      questionsPerSection: values.questionsPerSection,
      tags: values.tags,
      sectionCount: values.sectionCount,
      topic: selectedTopics.join(", "),
    }

    // Emit event to create test by book
    emitEvent(GENERATE_TEST_EVENTS.GENERATE_TEST_BY_FORM, payload)
  }

  // Force move to next step (for debugging)
  const forceNextStep = () => {
    clearProgressInterval()
    setIsGenerating(false)
    setGeneratingProgress(100)
    setStep(3)
  }

  // Next step
  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  // Previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Handle test save
  const handleSaveTest = () => {
    alert("Test saved successfully!")
    // router.push("/dashboard");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Test</h1>
        <p className="text-muted-foreground">Generate a new test using AI</p>
      </div>

      {/* Connection status */}
      <div className="mb-4">
        <div className={`flex items-center gap-2 ${isConnected ? "text-green-500" : "text-red-500"}`}>
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span>{isConnected ? "Connected to server" : "Not connected to server"}</span>
        </div>
        {error && <p className="text-red-500 mt-1">{error}</p>}
      </div>

      {/* Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <div className={`mx-2 h-1 w-10 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <div className={`mx-2 h-1 w-10 ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {step === 1 && "Choose method"}
            {step === 2 && "Configure test"}
            {step === 3 && "Preview test"}
          </div>
        </div>
      </div>

      {/* Step 1: Choose method */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-6 text-center hover:border-primary ${
                method === "form" ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setMethod("form")}
            >
              <FileText className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-xl font-medium">Create from Form</h3>
              <p className="text-sm text-muted-foreground">
                Enter subject, topics, and other details to generate a test
              </p>
            </div>
            <div
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-6 text-center hover:border-primary ${
                method === "book" ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setMethod("book")}
            >
              <BookOpen className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-xl font-medium">Create from Book</h3>
              <p className="text-sm text-muted-foreground">
                Upload a book (PDF, DOCX, TXT) and select topics to generate a test
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Configure test */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Required Fields Section */}
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Required Information</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Subject <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mathematics, Physics, History" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Grade Level <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gradeLevelOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {method === "form" && (
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>
                          Topic <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Algebra, World War II, Photosynthesis" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="sectionTypes"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>
                            Question Types <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormDescription>Select at least one question type</FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {sectionTypeOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="sectionTypes"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.value])
                                            : field.onChange(field.value?.filter((value) => value !== option.value))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option.label}</FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Book Upload Section (if method is book) */}
              {method === "book" && (
                <div className="rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">Book Upload</h3>
                  <div className="space-y-4">
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 ${
                        isDragging ? "border-primary bg-primary/5" : ""
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                    >
                      {file ? (
                        <div className="text-center">
                          <Check className="mx-auto mb-2 h-8 w-8 text-green-500" />
                          <p className="mb-1 font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => setFile(null)}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 text-lg font-medium">Drag and drop your file here</h3>
                          <p className="mb-4 text-sm text-muted-foreground">Supports PDF, DOCX, and TXT files</p>
                          <div className="flex items-center space-x-2">
                            <label htmlFor="file-upload">
                              <div className="flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                                Browse files
                              </div>
                              <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.txt"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </>
                      )}
                    </div>

                    {file && !isProcessing && processingProgress === 0 && (
                      <Button type="button" onClick={processBook} className="w-full">
                        Process Book
                      </Button>
                    )}

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing book...</span>
                          <span>{Math.round(processingProgress)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${processingProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {extractedTopics.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Extracted Topics</h3>
                        <p className="text-sm text-muted-foreground">
                          Select the topics you want to include in your test
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {extractedTopics.map((topic) => (
                            <div
                              key={topic}
                              className={`cursor-pointer rounded-full px-3 py-1 text-sm ${
                                selectedTopics.includes(topic)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                              onClick={() => toggleTopic(topic)}
                            >
                              {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Optional Fields Section */}
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Additional Options</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Midterm Exam, Chapter 5 Quiz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sectionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Sections</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="questionsPerSection"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Questions Per Section: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any specific instructions or context for the test"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormDescription>Add tags to categorize your test</FormDescription>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 rounded-full hover:bg-muted p-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addTag()
                              }
                            }}
                          />
                          <Button type="button" size="sm" onClick={addTag}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-2">
                  {isGenerating && (
                    <Button type="button" variant="outline" onClick={forceNextStep}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Skip Loading
                    </Button>
                  )}
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate with AI
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating test...</span>
                    <span>{Math.round(generatingProgress)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${generatingProgress}%` }} />
                  </div>
                </div>
              )}
            </form>
          </Form>
        </motion.div>
      )}

      {/* Step 3: Preview test */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-6">
            <TestPreview testData={testData} testResponse={testData} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSaveTest}>
                Save Test
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

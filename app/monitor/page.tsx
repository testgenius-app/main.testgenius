"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Clock, Users, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TestAccessInfo } from "@/components/test-access-info"
import { toast } from "@/components/ui/use-toast"
import { io, type Socket } from "socket.io-client"

// Define the WebSocket events
const ONLINE_TEST_EVENTS = {
  START_ONLINE_TEST: "start:online:test",
  ONLINE_TEST_STARTED: "online:test:started",
}

// Mock test data
const mockTestData = {
  testId: "test-123456",
  testCode: "ABC123",
  testLink: "https://testgenius.ai/join/ABC123",
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://testgenius.ai/join/ABC123",
  title: "Mathematics Assessment",
  subject: "Mathematics",
  duration: 60, // minutes
}

export default function TestMonitorPage() {
  // Test state management
  const [testState, setTestState] = useState<"not_started" | "starting" | "started">("not_started")
  const [timeRemaining, setTimeRemaining] = useState<number>(mockTestData.duration * 60) // in seconds
  const [participantCount, setParticipantCount] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

  // Use a ref to store the socket instance
  const socketRef = useRef<Socket | null>(null)

  // Set up WebSocket connection
  useEffect(() => {
    // Get the API URL from environment variables or use a default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

    console.log("Establishing WebSocket connection to:", apiUrl)

    // Create socket connection
    socketRef.current = io(apiUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Connection event handlers
    socketRef.current.on("connect", () => {
      console.log("WebSocket connected successfully")
      setIsConnected(true)
      toast({
        title: "Connected",
        description: "Successfully connected to the test server",
      })
    })

    socketRef.current.on("disconnect", () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
      toast({
        title: "Disconnected",
        description: "Lost connection to the test server",
        variant: "destructive",
      })
    })

    socketRef.current.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      setIsConnected(false)
      toast({
        title: "Connection Error",
        description: "Failed to connect to the test server",
        variant: "destructive",
      })
    })

    // Listen for the START_ONLINE_TEST event
    socketRef.current.on(ONLINE_TEST_EVENTS.START_ONLINE_TEST, (data) => {
      console.log("Received START_ONLINE_TEST event:", data)

      // Update state to started
      setTestState("started")

      // Show success toast
      toast({
        title: "Test Started",
        description: "The test has been started successfully",
      })

      // If the data includes a duration, update the time remaining
      if (data && data.durationInMinutes) {
        setTimeRemaining(data.durationInMinutes * 60)
      }
    })

    // Simulate participants joining (for demo purposes)
    const participantInterval = setInterval(() => {
      if (testState === "not_started" && participantCount < 5) {
        setParticipantCount((prev) => prev + 1)
      }
    }, 5000)

    // Cleanup function
    return () => {
      console.log("Cleaning up WebSocket connection")
      clearInterval(participantInterval)

      if (socketRef.current) {
        // Remove all event listeners
        socketRef.current.off("connect")
        socketRef.current.off("disconnect")
        socketRef.current.off("connect_error")
        socketRef.current.off(ONLINE_TEST_EVENTS.START_ONLINE_TEST)

        // Disconnect the socket
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [testState, participantCount])

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (testState === "started" && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })

        // Update progress
        const elapsedSeconds = mockTestData.duration * 60 - timeRemaining
        const progressPercentage = Math.min(100, Math.round((elapsedSeconds / (mockTestData.duration * 60)) * 100))
        setProgress(progressPercentage)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [testState, timeRemaining])

  // Handle start test button click
  const handleStartTest = () => {
    if (!isConnected || !socketRef.current) {
      toast({
        title: "Connection Error",
        description: "Not connected to the test server",
        variant: "destructive",
      })
      return
    }

    setTestState("starting")

    // Show toast notification
    toast({
      title: "Starting test",
      description: "Preparing test environment...",
    })

    // Emit event to start the test
    socketRef.current.emit(ONLINE_TEST_EVENTS.START_ONLINE_TEST, {
      testId: mockTestData.testId,
      durationInMinutes: mockTestData.duration,
    })

    // Set a timeout to handle cases where the server doesn't respond
    setTimeout(() => {
      if (testState === "starting") {
        console.log("No response from server, forcing test start")
        setTestState("started")
      }
    }, 5000)
  }

  // Format time remaining
  const formatTimeRemaining = () => {
    const hours = Math.floor(timeRemaining / 3600)
    const minutes = Math.floor((timeRemaining % 3600) / 60)
    const seconds = timeRemaining % 60

    return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Test Monitoring</h1>
          <p className="text-muted-foreground">Monitor test progress and participant activity</p>
        </div>

        {/* Connection status */}
        <div className="mb-6 flex justify-center">
          <div className={`flex items-center gap-2 ${isConnected ? "text-green-500" : "text-red-500"}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span>{isConnected ? "Connected to server" : "Not connected to server"}</span>
          </div>
        </div>

        {/* Test control section */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle>{mockTestData.title}</CardTitle>
            <CardDescription>
              Subject: {mockTestData.subject} • Duration: {mockTestData.duration} minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Time remaining */}
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">Time Remaining</span>
                </div>
                <div className="text-2xl font-mono font-bold">
                  {testState === "started" ? formatTimeRemaining() : `${mockTestData.duration}:00`}
                </div>
              </div>

              {/* Participants */}
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Participants</span>
                </div>
                <div className="text-2xl font-bold">{participantCount}</div>
              </div>

              {/* Progress */}
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium">Progress</span>
                </div>
                <div className="text-2xl font-bold mb-2">{progress}%</div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* Test status */}
            <div className="flex justify-center mb-4">
              <Badge variant={testState === "started" ? "default" : "outline"} className="px-4 py-1 text-sm">
                {testState === "not_started" && "Not Started"}
                {testState === "starting" && "Starting..."}
                {testState === "started" && "In Progress"}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <AnimatePresence mode="wait">
              {testState === "not_started" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    onClick={handleStartTest}
                    disabled={participantCount === 0 || !isConnected}
                    className="relative overflow-hidden group"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Test
                    <span className="absolute inset-0 flex h-full w-full items-center justify-center bg-primary opacity-0 transition-opacity group-hover:opacity-10">
                      <Play className="h-12 w-12" />
                    </span>
                  </Button>
                </motion.div>
              )}

              {testState === "starting" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span>Starting test...</span>
                </motion.div>
              )}

              {testState === "started" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Test in progress</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        </Card>

        {/* Test Access Information */}
        <AnimatePresence>
          {testState !== "started" && (
            <motion.div
              initial={{ opacity: 1, height: "auto" }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.5 }}
            >
              <TestAccessInfo
                testCode={mockTestData.testCode}
                testLink={mockTestData.testLink}
                qrCodeUrl={mockTestData.qrCodeUrl}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert for test started */}
        <AnimatePresence>
          {testState === "started" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-400">Test in Progress</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    The test is now in progress. Participants can no longer join with the access code.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

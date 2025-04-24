"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import HomePage from "./home-page"

export default function RootPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("access_token")

        // If authenticated, redirect to dashboard
        if (token) {
          router.replace("/dashboard")
        } else {
          // If not authenticated, allow rendering the landing page
          setIsCheckingAuth(false)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, render the landing page
  return <HomePage />
}

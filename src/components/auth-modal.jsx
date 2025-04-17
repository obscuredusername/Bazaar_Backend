"use client"

import { useState, useEffect } from "react"
import API_BASE_URL from "../config"
import { Mail, X, LogIn, UserPlus } from "lucide-react"

const AuthModal = ({ isOpen, onClose, emitMessage }) => {
  const [authMode, setAuthMode] = useState("login")
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleInitialized, setGoogleInitialized] = useState(false)

  // Initialize Google Auth Client
  useEffect(() => {
    // Load Google's authentication script
    const loadGoogleScript = () => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogleAuth
      document.body.appendChild(script)
    }

    // Initialize Google authentication
    const initializeGoogleAuth = () => {
      if (window.google && !googleInitialized) {
        window.google.accounts.id.initialize({
          client_id: '96398954937-fro4o9nvvftfue7a5q3ghhm7bbs1kqi4.apps.googleusercontent.com', // Replace with your actual Google Client ID
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })
        setGoogleInitialized(true)
      }
    }

    if (!googleInitialized && isOpen) {
      loadGoogleScript()
    }

    return () => {
      // Clean up if needed
    }
  }, [isOpen, googleInitialized])

  // Handle Google's response
  const handleGoogleResponse = async (response) => {
    if (!response || !response.credential) {
      setError("Google authentication failed")
      return
    }

    setLoading(true)
    try {
      // Send the Google ID token to your backend
      const endpoint = authMode === "signup" ? "/google-signup" : "/google-login"
      const apiResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: response.credential,
        }),
      })

      const data = await apiResponse.json()

      if (!apiResponse.ok) {
        throw new Error(data?.detail || "Google authentication failed")
      }

      if (authMode === "signup" && !data.user_id) {
        alert("Success: User has been created")
        setAuthMode("login")
      }

      if (data.user_id) {
        // Store user data in localStorage for session persistence
        const userData = {
          id: data.user_id,
          username: data.username,
          auth_provider: "google"
        }
        
        localStorage.setItem('bazaarUser', JSON.stringify(userData))
        
        // Pass user data back to parent component
        emitMessage(userData)
        
        alert(`${authMode === "signup" ? "Signup" : "Login"} with Google successful!`)
        onClose() // Close modal after successful login/signup
      } else {
        if (authMode === "login") throw new Error("No user ID returned")
      }
    } catch (error) {
      console.error("Google auth error:", error)
      setError(error.message || "Google authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Function to trigger Google sign-in popup
  const handleGoogleSignIn = () => {
    if (window.google && googleInitialized) {
      window.google.accounts.id.prompt()
    } else {
      setError("Google authentication is not initialized yet. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const { email, password, username, confirmPassword } = formData
    if (authMode === "signup") {
      if (!email || !password || !username || !confirmPassword) {
        setError("Please fill all the fields")
        return false
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return false
      }
    } else {
      if (!email || !password) {
        setError("Please fill all the fields")
        return false
      }
    }
    setError("")
    return true
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const isSignup = authMode === "signup"
      const endpoint = isSignup ? "/signup" : "/login"
      const bodyData = isSignup
        ? {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            contact_no: "",
          }
        : {
            email: formData.email,
            password: formData.password,
          }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.detail || "An error occurred")
      }

      if (isSignup) {
        alert("Success: User has been created")
        setAuthMode("login")
      }

      if (data.user_id) {
        // Store user data in localStorage for session persistence
        const userData = {
          id: data.user_id,
          username: data.username,
          auth_provider: "email"
        }
        
        localStorage.setItem('bazaarUser', JSON.stringify(userData))
        
        // Pass user data back to parent component
        emitMessage(userData)
        
        alert(`${isSignup ? "Signup" : "Login"} successful!`)
        onClose() // Close modal after successful login/signup
      } else {
        if (!isSignup) throw new Error("No user ID returned")
      }
    } catch (error) {
      console.error("Auth error:", error)
      setError(error.message || "Network error! Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-5 md:p-8 rounded-xl w-full max-w-md relative shadow-xl border-2 border-amber-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-amber-900">
          {authMode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {showEmailForm ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="Enter your username"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-all font-medium flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center">
                  {authMode === "login" ? (
                    <LogIn className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {authMode === "login" ? "Login" : "Sign Up"}
                </span>
              )}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false)
                  setError("")
                }}
                className="text-amber-600 text-sm hover:text-amber-800 underline"
              >
                Back to options
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-all flex items-center justify-center font-medium"
            >
              <Mail className="h-5 w-5 mr-2" />
              Continue with Email
            </button>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-amber-800 p-2 border border-amber-300 rounded-lg hover:bg-amber-50 transition-all flex items-center justify-center font-medium relative"
              disabled={loading || !googleInitialized}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-amber-600 border-t-transparent rounded-full"></span>
                  Processing...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="mr-2">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        )}

        <div className="text-center mt-6 text-sm text-amber-700">
          {authMode === "login" ? (
            <p>
              Don't have an account?
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup")
                  setError("")
                }}
                className="text-amber-600 ml-1 font-medium hover:text-amber-800"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login")
                  setError("")
                }}
                className="text-amber-600 ml-1 font-medium hover:text-amber-800"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
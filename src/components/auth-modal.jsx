"use client"

import { useState } from "react"
import API_BASE_URL from "../config"

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
          username: data.username
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
      alert(error.message || "Network error! Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-1000 bg-opacity-100 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg w-96 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {authMode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        {showEmailForm ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Enter your username"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-all font-medium"
              disabled={loading}
            >
              {loading ? "Loading..." : authMode === "login" ? "Login" : "Sign Up"}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-teal-600 text-sm hover:text-teal-800 underline"
              >
                Back to options
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-all flex items-center justify-center font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              Continue with Email
            </button>

            <button
              onClick={() => alert("Google sign in clicked")}
              className="w-full bg-white text-gray-700 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center font-medium"
            >
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
            </button>
          </div>
        )}

        <div className="text-center mt-6 text-sm text-gray-600">
          {authMode === "login" ? (
            <p>
              Don't have an account?
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup")
                  setError("")
                }}
                className="text-teal-600 ml-1 font-medium hover:text-teal-800"
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
                className="text-teal-600 ml-1 font-medium hover:text-teal-800"
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
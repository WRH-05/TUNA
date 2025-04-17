"use client"

import type React from "react"

import { useState } from "react"

interface URLFormProps {
  onSubmit: (url: string) => void
  buttonText?: string
  isLoading?: boolean
}

export default function URLForm({ onSubmit, buttonText = "Submit", isLoading = false }: URLFormProps) {
  const [url, setUrl] = useState("")
  const [isValid, setIsValid] = useState(true)

  const validateUrl = (value: string) => {
    if (!value) return true

    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    setIsValid(validateUrl(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url || !isValid) return

    onSubmit(url)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-grow">
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="Enter URL (e.g., https://example.com)"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            isValid ? "focus:ring-blue-500 border-gray-300" : "focus:ring-red-500 border-red-300"
          }`}
        />
        {!isValid && <p className="mt-1 text-sm text-red-600">Please enter a valid URL</p>}
      </div>
      <button
        type="submit"
        disabled={!url || !isValid || isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Loading..." : buttonText}
      </button>
    </form>
  )
}

"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Trash2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"

interface Capture {
  id: string
  url: string
  timestamp: number
  text_content: any
  image_path: string | null
  created_at: string
  imageUrl?: string
}

interface CaptureListProps {
  initialCaptures: Capture[]
  onDelete?: (id: string) => void
}

export default function CaptureList({ initialCaptures, onDelete }: CaptureListProps) {
  const [captures, setCaptures] = useState<Capture[]>(initialCaptures)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createBrowserClient()

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("captures-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "captures",
        },
        (payload) => {
          // Fetch the new capture with signed URL
          fetchCapture(payload.new.id).then((newCapture) => {
            if (newCapture) {
              setCaptures((prev) => [newCapture, ...prev])
            }
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "captures",
        },
        (payload) => {
          setCaptures((prev) => prev.filter((capture) => capture.id !== payload.old.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchCapture = async (id: string) => {
    const { data } = await supabase.from("captures").select("*").eq("id", id).single()

    if (data && data.image_path) {
      const { data: signedUrl } = await supabase.storage.from("captures").createSignedUrl(data.image_path, 60 * 60) // 1 hour expiry

      return {
        ...data,
        imageUrl: signedUrl?.signedUrl,
      }
    }

    return data
  }

  const handleDelete = async (id: string) => {
    if (onDelete) {
      onDelete(id)
    } else {
      try {
        const response = await fetch(`/api/captures/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete capture")
        }
      } catch (err) {
        console.error("Error deleting capture:", err)
      }
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (captures.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-500">No captures found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Captures ({captures.length})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {captures.map((capture) => (
          <div key={capture.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 truncate max-w-xs" title={capture.url}>
                    {capture.url}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(capture.created_at), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-gray-500">Snapshot at {capture.timestamp}ms</p>
                </div>
                <button
                  onClick={() => handleDelete(capture.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label="Delete capture"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {capture.imageUrl && (
              <div className="border-b cursor-pointer" onClick={() => toggleExpand(capture.id)}>
                <img
                  src={capture.imageUrl || "/placeholder.svg"}
                  alt={`Capture of ${capture.url}`}
                  className="w-full h-auto"
                />
              </div>
            )}

            {expandedId === capture.id && (
              <div className="p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Extracted Text:</h4>
                <div className="bg-white border rounded p-3 max-h-60 overflow-y-auto text-sm">
                  {capture.text_content ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(capture.text_content, null, 2)}</pre>
                  ) : (
                    <em className="text-gray-500">No text content extracted</em>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

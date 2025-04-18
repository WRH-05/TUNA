// Configuration
const CAPTURE_INTERVAL = 50 // ms
const MAX_CAPTURE_TIME = 500 // ms
const API_ENDPOINT = "http://localhost:3000/api/capture"

// Track if we're already capturing
let isCapturing = false

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCapture") {
    if (isCapturing) {
      sendResponse({ success: false, error: "Capture already in progress" })
      return
    }

    performCapture()
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => {
        console.error("Capture error:", error)
        sendResponse({ success: false, error: error.message })
      })

    return true // Required for async sendResponse
  }
})

// Main capture function
async function performCapture() {
  try {
    isCapturing = true

    // Load html2canvas dynamically
    await loadHtml2Canvas()

    const url = window.location.href
    const startTime = performance.now()
    const captures = []

    // Set up intervals for capturing
    for (let time = 0; time <= MAX_CAPTURE_TIME; time += CAPTURE_INTERVAL) {
      setTimeout(async () => {
        try {
          const timestamp = Math.round(performance.now() - startTime)
          const capture = await captureSnapshot(timestamp)
          captures.push(capture)

          // Send to server if this is the last capture
          if (timestamp >= MAX_CAPTURE_TIME) {
            await sendCapturesToServer(captures)
            isCapturing = false
          }
        } catch (error) {
          console.error(`Error capturing at ${time}ms:`, error)
          // Try text-only fallback if image capture fails
          try {
            const timestamp = Math.round(performance.now() - startTime)
            const textContent = extractTextContent()
            captures.push({ timestamp, textContent, imageBlob: null })
          } catch (fallbackError) {
            console.error("Text fallback also failed:", fallbackError)
          }
        }
      }, time)
    }

    return { success: true, message: "Capture started" }
  } catch (error) {
    isCapturing = false
    throw error
  }
}

// Load html2canvas dynamically
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"
    script.onload = resolve
    script.onerror = () => reject(new Error("Failed to load html2canvas"))
    document.head.appendChild(script)
  })
}

// Capture a single snapshot
async function captureSnapshot(timestamp) {
  try {
    // Capture screenshot using html2canvas
    const canvas = await window.html2canvas(document.body, {
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    })

    // Convert canvas to blob URL
    const imageBlob = canvas.toDataURL("image/jpeg", 0.8)

    // Extract text content
    const textContent = extractTextContent()

    return {
      timestamp,
      imageBlob,
      textContent,
    }
  } catch (error) {
    console.error("Error in captureSnapshot:", error)
    throw error
  }
}

// Extract text content from DOM
function extractTextContent() {
  const textNodes = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)

  let node
  while ((node = walker.nextNode())) {
    const text = node.textContent.trim()
    if (text) {
      const parentElement = node.parentElement
      const tagName = parentElement.tagName.toLowerCase()
      const className = parentElement.className
      const id = parentElement.id

      textNodes.push({
        text,
        path: getNodePath(parentElement),
        metadata: { tagName, className, id },
      })
    }
  }

  return JSON.stringify(textNodes)
}

// Get DOM path for a node
function getNodePath(element) {
  const path = []
  let current = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      selector += `#${current.id}`
    } else if (current.className) {
      selector += `.${current.className.split(" ").join(".")}`
    } else {
      const siblings = Array.from(current.parentNode.children)
      const index = siblings.indexOf(current) + 1
      selector += `:nth-child(${index})`
    }

    path.unshift(selector)
    current = current.parentNode
  }

  return path.join(" > ")
}

// Send captures to server
async function sendCapturesToServer(captures) {
  const url = window.location.href

  for (const capture of captures) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          ...capture,
        }),
        credentials: "include", // Important for auth cookies
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }
    } catch (error) {
      console.error("Error sending capture to server:", error)
    }
  }
}

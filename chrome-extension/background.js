// Track capture status to avoid duplicate captures
let captureInProgress = false
let retryCount = 0
const MAX_RETRIES = 3

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureUrl") {
    captureUrl(message.url)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => {
        console.error("Capture error:", error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Required for async sendResponse
  }
})

// Function to capture a URL
async function captureUrl(url) {
  if (captureInProgress) {
    throw new Error("A capture is already in progress")
  }

  try {
    captureInProgress = true
    retryCount = 0

    // Inject content script to perform the capture
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab) {
      throw new Error("No active tab found")
    }

    // If URL is provided, navigate to it first
    if (url && tab.url !== url) {
      await chrome.tabs.update(tab.id, { url })

      // Wait for navigation to complete
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener)
          reject(new Error("Navigation timeout"))
        }, 30000)

        const listener = (tabId, changeInfo) => {
          if (tabId === tab.id && changeInfo.status === "complete") {
            clearTimeout(timeout)
            chrome.tabs.onUpdated.removeListener(listener)

            // Execute content script to start capture
            startCapture(tab.id)
              .then(resolve)
              .catch((error) => {
                if (retryCount < MAX_RETRIES) {
                  retryCount++
                  return startCapture(tab.id)
                }
                reject(error)
              })
          }
        }

        chrome.tabs.onUpdated.addListener(listener)
      })
    } else {
      // If we're already on the right URL, just start the capture
      return startCapture(tab.id)
    }
  } finally {
    captureInProgress = false
  }
}

// Function to start the capture process
async function startCapture(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: "startCapture" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else if (!response || !response.success) {
        reject(new Error(response?.error || "Unknown error during capture"))
      } else {
        resolve(response.result)
      }
    })
  })
}

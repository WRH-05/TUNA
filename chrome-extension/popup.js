document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url');
  const captureBtn = document.getElementById('captureBtn');
  const captureUrlBtn = document.getElementById('captureUrlBtn');
  const statusDiv = document.getElementById('status');
  
  // Capture current page
  captureBtn.addEventListener('click', async () => {
    try {
      setStatus('Capturing current page...', 'info');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('No active tab found');
      }
      
      const response = await chrome.runtime.sendMessage({
        action: 'captureUrl',
        url: tab.url
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }
      
      setStatus('Page captured successfully!', 'success');
    } catch (error) {
      console.error('Capture error:', error);
      setStatus(`Error: ${error.message}`, 'error');
    }
  });
  
  // Capture specific URL
  captureUrlBtn.addEventListener('click', async () => {
    try {
      const url = urlInput.value.trim();
      
      if (!url) {
        throw new Error('Please enter a URL');
      }
      
      if (!isValidUrl(url)) {
        throw new Error('Please enter a valid URL');
      }
      
      setStatus(`Capturing ${url}...`, 'info');
      
      const response = await chrome.runtime.sendMessage({
        action: 'captureUrl',
        url
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }
      
      setStatus('URL captured successfully!', 'success');
    } catch (error) {
      console.error('Capture error:', error);
      setStatus(`Error: ${error.message}`, 'error');
    }
  });
  
  // Helper function to validate URL
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }  
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  
  // Helper function to set status message
  function setStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }\
});

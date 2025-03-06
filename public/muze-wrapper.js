// Muze Library Wrapper
console.log("Muze wrapper script loaded");

// Create a global muze object that will be populated once the library is loaded
window.muze = null;

// Function to load the Muze library
function loadMuzeLibrary() {
  console.log("Attempting to load Muze library");
  
  // Create a promise that will resolve when the library is loaded
  return new Promise((resolve, reject) => {
    // First, check if muze is already defined
    if (typeof window.muze !== 'undefined' && window.muze) {
      console.log("Muze already available");
      document.dispatchEvent(new Event('muze-loaded'));
      resolve(true);
      return;
    }
    
    // Create a script element to load the library
    const script = document.createElement('script');
    
    // Set up event handlers
    script.onload = function() {
      console.log("Muze script loaded, checking for muze object");
      
      // Give it a moment to initialize
      setTimeout(() => {
        if (typeof window.muze !== 'undefined' && window.muze) {
          console.log("Muze library loaded successfully");
          document.dispatchEvent(new Event('muze-loaded'));
          resolve(true);
        } else {
          const error = new Error("Muze script loaded but muze object is not defined");
          console.error(error);
          document.dispatchEvent(new CustomEvent('muze-error', { detail: error }));
          reject(error);
        }
      }, 100);
    };
    
    script.onerror = function(event) {
      const error = new Error("Failed to load Muze script");
      console.error("Script load error:", event);
      document.dispatchEvent(new CustomEvent('muze-error', { detail: error }));
      reject(error);
    };
    
    // Try to load the original muze.js file (not the renamed one)
    script.src = '/lib/muze.js';
    document.head.appendChild(script);
    
    console.log("Muze script tag added to document");
  });
}

// Create a patched version of the muze.js file
function createPatchedMuzeFile() {
  console.log("Creating patched version of muze.js");
  
  return new Promise((resolve, reject) => {
    // Fetch the original muze.js file
    fetch('/lib/muze.js')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch muze.js: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(content => {
        // Find the problematic line with await
        const awaitLineIndex = content.indexOf('const ct = await');
        
        if (awaitLineIndex === -1) {
          console.log("No await statement found, file may already be patched");
          resolve(false);
          return;
        }
        
        // Find the start of the line
        const lineStart = content.lastIndexOf('\n', awaitLineIndex) + 1;
        
        // Find the end of the statement (semicolon or next line)
        let lineEnd = content.indexOf(';', awaitLineIndex);
        if (lineEnd === -1) {
          lineEnd = content.indexOf('\n', awaitLineIndex);
        }
        if (lineEnd === -1) {
          lineEnd = content.length;
        }
        
        // Extract the problematic statement
        const awaitStatement = content.substring(lineStart, lineEnd + 1);
        console.log("Found await statement:", awaitStatement);
        
        // Create the patched content
        const patchedContent = content.substring(0, lineStart) +
          '// Patched by muze-wrapper.js to fix await syntax error\n' +
          '(async function() {\n' +
          awaitStatement + '\n' +
          '  // Make variables global\n' +
          '  window.ct = ct;\n' +
          '})().catch(console.error);\n' +
          content.substring(lineEnd + 1);
        
        // Create a blob with the patched content
        const blob = new Blob([patchedContent], { type: 'application/javascript' });
        
        // Create an object URL for the blob
        const patchedUrl = URL.createObjectURL(blob);
        console.log("Created patched Muze file at URL:", patchedUrl);
        
        // Load the patched file
        const script = document.createElement('script');
        script.onload = function() {
          console.log("Patched Muze script loaded");
          resolve(true);
        };
        script.onerror = function(event) {
          console.error("Failed to load patched Muze script:", event);
          reject(new Error("Failed to load patched Muze script"));
        };
        script.src = patchedUrl;
        document.head.appendChild(script);
      })
      .catch(error => {
        console.error("Error creating patched Muze file:", error);
        reject(error);
      });
  });
}

// Try different approaches to load the Muze library
async function initializeMuze() {
  try {
    console.log("Initializing Muze");
    
    // First try loading the original file
    try {
      await loadMuzeLibrary();
      console.log("Muze loaded successfully with standard approach");
      return true;
    } catch (error) {
      console.log("Standard loading approach failed, trying patched version");
    }
    
    // If that fails, try creating a patched version
    try {
      const patched = await createPatchedMuzeFile();
      if (patched) {
        console.log("Muze loaded successfully with patched version");
        return true;
      }
    } catch (patchError) {
      console.error("Failed to create patched version:", patchError);
    }
    
    // If all approaches fail, dispatch an error event
    const finalError = new Error("All Muze loading approaches failed");
    document.dispatchEvent(new CustomEvent('muze-error', { detail: finalError }));
    return false;
  } catch (error) {
    console.error("Error in Muze initialization:", error);
    document.dispatchEvent(new CustomEvent('muze-error', { detail: error }));
    return false;
  }
}

// Load the library when the page loads
window.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing Muze");
  initializeMuze()
    .then(success => {
      if (success) {
        console.log("Muze initialization complete");
      } else {
        console.error("Failed to initialize Muze");
      }
    })
    .catch(error => {
      console.error("Error during Muze initialization:", error);
    });
});

// Export the functions
window.loadMuzeLibrary = loadMuzeLibrary;
window.initializeMuze = initializeMuze; 
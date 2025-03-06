import { useEffect, useRef, useState } from 'react';
import { mockContext, transformDataForMuze } from '../thoughtspot';

interface ChartRendererProps {
  code: string;
  useThoughtSpotData?: boolean;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ code, useThoughtSpotData = false }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [iframeHtml, setIframeHtml] = useState<string>('');

  // Add debug log function
  const addDebugLog = (message: string) => {
    console.log(`[ChartRenderer Debug] ${message}`);
    setDebugLog(prev => [...prev, message]);
  };

  useEffect(() => {
    if (!code) {
      addDebugLog("No code available");
      return;
    }

    addDebugLog("Starting chart rendering process");
    addDebugLog(`Using ThoughtSpot data: ${useThoughtSpotData}`);

    // Reset error state
    setError(null);

    // Get ThoughtSpot data if enabled
    let thoughtSpotData = null;
    try {
      if (useThoughtSpotData) {
        addDebugLog("Transforming ThoughtSpot data");
        thoughtSpotData = transformDataForMuze(mockContext.getChartModel());
        addDebugLog(`Transformed data has ${thoughtSpotData.length} rows`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugLog(`Error transforming ThoughtSpot data: ${errorMessage}`);
      setError(`Error transforming ThoughtSpot data: ${errorMessage}`);
      return;
    }

    addDebugLog("Generating HTML content for iframe");
    
    // Generate the HTML content for the iframe
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Muze Chart</title>
          <script src="https://cdn.jsdelivr.net/npm/@viz/muze@4.7.5/dist/muze.js"></script>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
            #chart {
              width: 100%;
              height: 100vh;
            }
            .error-container {
              color: red;
              padding: 20px;
              font-family: monospace;
              white-space: pre-wrap;
              overflow: auto;
              max-height: 100vh;
            }
            .thoughtspot-badge {
              position: absolute;
              top: 10px;
              right: 10px;
              background-color: #0066cc;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .debug-log {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background-color: rgba(0,0,0,0.8);
              color: #00ff00;
              font-family: monospace;
              font-size: 12px;
              padding: 10px;
              max-height: 150px;
              overflow-y: auto;
              z-index: 1000;
            }
          </style>
        </head>
        <body>
          <div id="chart"></div>
          ${useThoughtSpotData ? '<div class="thoughtspot-badge">ThoughtSpot Data</div>' : ''}
          <div id="debug-log" class="debug-log"></div>
          <script>
            // Debug logging function
            function debugLog(message) {
              console.log("[Chart Debug] " + message);
              const logElement = document.getElementById('debug-log');
              if (logElement) {
                const logEntry = document.createElement('div');
                logEntry.textContent = new Date().toISOString().substr(11, 8) + ": " + message;
                logElement.appendChild(logEntry);
                logElement.scrollTop = logElement.scrollHeight;
              }
              // Send log to parent
              window.parent.postMessage({ type: 'chart-debug', message: message }, '*');
            }

            debugLog("Chart script started");
            
            // Data helper function
            const viz = {
              muze: window.muze,
              getDataFromSearchQuery: function() {
                debugLog("getDataFromSearchQuery called");
                // Use ThoughtSpot data if available, otherwise use sample data
                ${useThoughtSpotData 
                  ? `debugLog("Using ThoughtSpot data");
                     return ${JSON.stringify(thoughtSpotData)};` 
                  : `debugLog("Using sample data");
                     return [
                      { Year: 2020, Origin: 'USA', Horsepower: 200, 'Miles_per_Gallon': 25, Weight_in_lbs: 3000, Name: 'Car A', Maker: 'Ford' },
                      { Year: 2020, Origin: 'Japan', Horsepower: 180, 'Miles_per_Gallon': 30, Weight_in_lbs: 2800, Name: 'Car B', Maker: 'Toyota' },
                      { Year: 2020, Origin: 'Germany', Horsepower: 220, 'Miles_per_Gallon': 22, Weight_in_lbs: 3200, Name: 'Car C', Maker: 'BMW' },
                      { Year: 2021, Origin: 'USA', Horsepower: 210, 'Miles_per_Gallon': 26, Weight_in_lbs: 2950, Name: 'Car D', Maker: 'Ford' },
                      { Year: 2021, Origin: 'Japan', Horsepower: 190, 'Miles_per_Gallon': 32, Weight_in_lbs: 2750, Name: 'Car E', Maker: 'Toyota' },
                      { Year: 2021, Origin: 'Germany', Horsepower: 230, 'Miles_per_Gallon': 23, Weight_in_lbs: 3150, Name: 'Car F', Maker: 'BMW' },
                      { Year: 2022, Origin: 'USA', Horsepower: 220, 'Miles_per_Gallon': 27, Weight_in_lbs: 2900, Name: 'Car G', Maker: 'Ford' },
                      { Year: 2022, Origin: 'Japan', Horsepower: 200, 'Miles_per_Gallon': 33, Weight_in_lbs: 2700, Name: 'Car H', Maker: 'Toyota' },
                      { Year: 2022, Origin: 'Germany', Horsepower: 240, 'Miles_per_Gallon': 24, Weight_in_lbs: 3100, Name: 'Car I', Maker: 'BMW' }
                    ];`
                }
              }
            };

            try {
              debugLog("Executing generated chart code");
              // Log the code being executed
              debugLog("Code: " + \`${code.replace(/`/g, '\\`')}\`);
              
              // Execute the generated code
              ${code}
              
              debugLog("Chart code executed successfully");
            } catch (error) {
              const errorMessage = error.message || 'Unknown error';
              debugLog("Error executing chart code: " + errorMessage);
              console.error('Error executing chart code:', error);
              document.getElementById('chart').innerHTML = '<div class="error-container">Error rendering chart: ' + errorMessage + '</div>';
              window.parent.postMessage({ type: 'chart-error', message: errorMessage }, '*');
            }
          </script>
        </body>
      </html>
    `;

    addDebugLog("Setting iframe content");
    
    // Instead of directly manipulating the iframe document, use srcdoc
    setIframeHtml(htmlContent);
    addDebugLog("Iframe content set via srcdoc");

    // Listen for error messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'chart-error') {
          addDebugLog(`Received error from iframe: ${event.data.message}`);
          setError(event.data.message);
        } else if (event.data.type === 'chart-debug') {
          addDebugLog(`Iframe: ${event.data.message}`);
        }
      }
    };

    addDebugLog("Adding message event listener");
    window.addEventListener('message', handleMessage);

    return () => {
      addDebugLog("Cleaning up event listener");
      window.removeEventListener('message', handleMessage);
    };
  }, [code, useThoughtSpotData]);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 text-sm z-10">
          Error: {error}
        </div>
      )}
      <iframe 
        ref={iframeRef}
        title="Chart Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts"
        srcDoc={iframeHtml}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-green-400 p-2 text-xs font-mono max-h-32 overflow-y-auto">
        <div className="font-bold mb-1">Debug Log:</div>
        {debugLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default ChartRenderer; 
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
          <!-- Load D3.js first (Muze dependency) -->
          <script src="https://d3js.org/d3.v5.min.js"></script>
          <!-- Load Muze from local path (private library) -->
          <script src="/lib/muze.js"></script>
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
            
            // Check if D3 is loaded
            if (typeof d3 === 'undefined') {
              debugLog("ERROR: D3 library not loaded");
              document.body.innerHTML = '<div class="error-container"><h2>Error: D3 library not loaded</h2><p>The D3 visualization library could not be loaded. Please check your internet connection and try again.</p></div>' + document.body.innerHTML;
              window.parent.postMessage({ type: 'chart-error', message: "D3 library not loaded" }, '*');
            } else {
              debugLog("D3 library loaded successfully: v" + d3.version);
            }
            
            // Create a simple fallback visualization using D3 if Muze fails
            function createFallbackChart() {
              debugLog("Creating fallback D3 chart");
              const data = [
                { category: "A", value: 30 },
                { category: "B", value: 70 },
                { category: "C", value: 50 }
              ];
              
              const width = 400;
              const height = 300;
              const margin = { top: 20, right: 20, bottom: 30, left: 40 };
              
              const svg = d3.select("#chart").append("svg")
                .attr("width", width)
                .attr("height", height);
                
              const g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                
              const x = d3.scaleBand()
                .rangeRound([0, width - margin.left - margin.right])
                .padding(0.1)
                .domain(data.map(d => d.category));
                
              const y = d3.scaleLinear()
                .rangeRound([height - margin.top - margin.bottom, 0])
                .domain([0, d3.max(data, d => d.value)]);
                
              g.append("g")
                .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
                .call(d3.axisBottom(x));
                
              g.append("g")
                .call(d3.axisLeft(y).ticks(10))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Value");
                
              g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.category))
                .attr("y", d => y(d.value))
                .attr("width", x.bandwidth())
                .attr("height", d => height - margin.top - margin.bottom - y(d.value))
                .attr("fill", "steelblue");
                
              svg.append("text")
                .attr("x", width / 2)
                .attr("y", margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Fallback Chart (Muze failed to load)");
                
              debugLog("Fallback D3 chart created successfully");
            }
            
            // Wait for everything to load
            window.onload = function() {
              debugLog("Window loaded");
              
              // Check if Muze is available
              if (typeof muze === 'undefined') {
                debugLog("ERROR: Muze library not loaded");
                document.body.innerHTML = '<div class="error-container"><h2>Error: Muze library not loaded</h2><p>The Muze visualization library could not be loaded. This is a private library that should be available at /lib/muze.js.</p></div>' + document.body.innerHTML;
                window.parent.postMessage({ type: 'chart-error', message: "Muze library not loaded" }, '*');
                
                // Create a fallback chart using D3
                createFallbackChart();
                return;
              }
              
              debugLog("Muze library loaded successfully");
              
              try {
                // Initialize global Muze instance
                const rawMuze = muze;
                debugLog("rawMuze created: " + (typeof rawMuze));
                
                const muzeGlobalContext = rawMuze();
                debugLog("muzeGlobalContext created: " + (typeof muzeGlobalContext));
                
                if (!muzeGlobalContext || typeof muzeGlobalContext.canvas !== 'function') {
                  throw new Error("Muze global context is invalid or canvas method is missing");
                }
                
                // Create the viz object with Muze API wrapper
                window.viz = {
                  muze: {
                    // Core Muze properties
                    DataStore: rawMuze.DataStore,
                    DataModel: rawMuze.DataModel,
                    version: rawMuze.version,
                    SideEffects: rawMuze.SideEffects,
                    ActionModel: rawMuze.ActionModel,
                    layerFactory: rawMuze.layerFactory,
                    Operators: rawMuze.Operators,
                    Behaviours: rawMuze.Behaviours,
                    utils: rawMuze.utils,
                    Themes: rawMuze.Themes,
                    
                    // Canvas method with configuration
                    canvas: function() {
                      debugLog("Creating canvas");
                      const canvas = muzeGlobalContext.canvas();
                      debugLog("Canvas created: " + (typeof canvas));
                      
                      // Add default configuration
                      canvas.config({
                        interaction: {
                          tooltip: { enabled: true },
                          pan: { enabled: true },
                          zoom: { enabled: true }
                        }
                      });
                      
                      return canvas;
                    }
                  },
                  
                  // Data helper function
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
                  
                  // Create a fallback chart using D3
                  createFallbackChart();
                }
              } catch (e) {
                const errorMessage = e.message || 'Unknown error';
                debugLog("Error initializing Muze: " + errorMessage);
                document.getElementById('chart').innerHTML = '<div class="error-container">Error initializing Muze: ' + errorMessage + '</div>';
                window.parent.postMessage({ type: 'chart-error', message: errorMessage }, '*');
                
                // Create a fallback chart using D3
                createFallbackChart();
              }
            };
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
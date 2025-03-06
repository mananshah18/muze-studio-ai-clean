import React, { useRef, useState, useEffect } from 'react';
import { transformCode } from '../utils/codeTransformer';

interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [muzeVersion, setMuzeVersion] = useState<string>('Unknown');

  // Auto-execute code when component mounts
  useEffect(() => {
    executeCode();
  }, []);

  const executeCode = () => {
    if (!containerRef.current || !iframeRef.current) return;
    setError(null);
    setDebugInfo('');

    try {
      // Transform the code to be executable in the iframe
      const transformedCode = transformCode(code);
      
      // Add our own debug logs to see what's happening
      console.log("Transformed code:", transformedCode);
      
      // Create the HTML content for the iframe
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chart Preview</title>
            <link rel="stylesheet" href="/lib/muze.css">
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #ffffff;
                display: flex;
                flex-direction: column;
                height: 100vh;
              }
              #chart {
                width: 100%;
                height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-bottom: 1px solid #ccc;
              }
              #fallback-chart {
                width: 100%;
                height: 200px;
                margin-top: 20px;
                border-top: 1px solid #ccc;
                padding-top: 10px;
              }
              #debug {
                padding: 10px;
                background-color: #f0f0f0;
                font-family: monospace;
                font-size: 12px;
                overflow: auto;
                max-height: 30vh;
              }
              .error-container {
                color: red;
                padding: 20px;
              }
              .section-title {
                font-size: 14px;
                font-weight: bold;
                margin: 10px 0;
                color: #333;
                text-align: center;
              }
              .muze-version {
                position: absolute;
                top: 5px;
                right: 10px;
                font-size: 12px;
                color: #666;
                background: rgba(255,255,255,0.8);
                padding: 2px 5px;
                border-radius: 3px;
              }
            </style>
            <!-- Load D3.js first (Muze dependency) -->
            <script src="https://d3js.org/d3.v5.min.js"></script>
            
            <!-- Load Muze from local file as a module -->
            <script type="module">
              let muze;
              try {
                // Try to import muze from the library
                const muzeModule = await import('/lib/muze.js');
                muze = muzeModule.default || muzeModule;
                console.log("Muze imported successfully:", muze);
              } catch (error) {
                console.error("Error importing Muze:", error);
                // Set a global error that we can check later
                window.muzeImportError = error;
              }

              // Simple debug function that writes to the debug div
              function debugLog(message, data) {
                const debugEl = document.getElementById('debug');
                const logItem = document.createElement('div');
                
                // Format the message and data
                let dataStr = '';
                try {
                  dataStr = JSON.stringify(data, null, 2);
                } catch (e) {
                  dataStr = String(data);
                }
                
                logItem.innerHTML = '<strong>' + message + '</strong>: ' + dataStr;
                debugEl.appendChild(logItem);
                
                // Also log to console
                console.log(message, data);
              }
              
              debugLog('Window loaded', {});
              
              // Check if Muze is available
              if (typeof muze === 'undefined') {
                let errorMessage = 'Muze library not loaded';
                
                // Check if we have a specific import error
                if (window.muzeImportError) {
                  errorMessage += ': ' + window.muzeImportError.message;
                  debugLog('Muze import error details', { 
                    message: window.muzeImportError.message,
                    stack: window.muzeImportError.stack
                  });
                }
                
                debugLog('ERROR: ' + errorMessage, {});
                document.body.innerHTML = '<div class="error-container"><h2>Error: Muze library not loaded</h2><p>' + errorMessage + '</p><p>Please check the browser console for more details.</p></div>' + document.body.innerHTML;
              } else {
                debugLog('Muze library loaded', { type: typeof muze });
                
                try {
                  // Create rawMuze similar to reference implementation
                  const rawMuze = muze;
                  debugLog('rawMuze created', { type: typeof rawMuze });
                  
                  // Initialize global Muze instance
                  const muzeGlobalContext = rawMuze();
                  const versionInfo = muzeGlobalContext.version || 'Unknown';
                  debugLog('Muze version', versionInfo);
                  
                  const versionEl = document.createElement('div');
                  versionEl.className = 'muze-version';
                  versionEl.textContent = 'Muze v' + versionInfo;
                  document.body.appendChild(versionEl);
                  
                  // Send version back to parent
                  window.parent.postMessage({ type: 'muze-version', version: versionInfo }, '*');
                  
                  // Initialize Muze
                  try {
                    debugLog('Creating fallback chart', {});
                    
                    // Sample data for the fallback chart
                    const fallbackData = [
                      { Category: "A", Value: 30 },
                      { Category: "B", Value: 70 },
                      { Category: "C", Value: 50 }
                    ];
                    
                    // Define schema
                    const schema = [
                      { name: "Category", type: "dimension" },
                      { name: "Value", type: "measure", defAggFn: "sum" }
                    ];
                    
                    try {
                      // Check if DataModel exists
                      if (!muzeGlobalContext.DataModel) {
                        throw new Error('DataModel is not available on the muze context');
                      }
                      
                      // Create DataModel with proper error handling
                      let rootData;
                      try {
                        // Check if loadDataSync method exists
                        if (typeof muzeGlobalContext.DataModel.loadDataSync === 'function') {
                          const formattedData = muzeGlobalContext.DataModel.loadDataSync(fallbackData, schema);
                          rootData = new muzeGlobalContext.DataModel(formattedData);
                        } else {
                          // Fallback to direct constructor
                          rootData = new muzeGlobalContext.DataModel(fallbackData);
                        }
                      } catch (dataModelError) {
                        debugLog('Error creating DataModel for fallback chart', { 
                          message: dataModelError.message 
                        });
                        // Create a simple D3 fallback chart instead
                        createD3FallbackChart();
                        return;
                      }
                      
                      // Create and mount the chart
                      try {
                        muzeGlobalContext
                          .canvas()
                          .rows(["Category"])
                          .columns(["Value"])
                          .layers([
                            {
                              mark: "bar"
                            }
                          ])
                          .data(rootData)
                          .mount("#fallback-chart");
                        
                        debugLog('Fallback chart rendered', { target: '#fallback-chart' });
                      } catch (chartError) {
                        debugLog('Error mounting fallback chart', { 
                          message: chartError.message 
                        });
                        // Create a simple D3 fallback chart instead
                        createD3FallbackChart();
                      }
                    } catch (error) {
                      debugLog('Error initializing fallback chart', { 
                        message: error.message 
                      });
                      // Create a simple D3 fallback chart instead
                      createD3FallbackChart();
                    }
                    
                    // Simple D3 fallback chart function
                    function createD3FallbackChart() {
                      debugLog('Creating D3 fallback chart', {});
                      try {
                        if (typeof d3 === 'undefined') {
                          debugLog('D3 not available for fallback chart', {});
                          return;
                        }
                        
                        const width = 300;
                        const height = 200;
                        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
                        
                        const svg = d3.select("#fallback-chart").append("svg")
                          .attr("width", width)
                          .attr("height", height);
                          
                        const g = svg.append("g")
                          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                          
                        const x = d3.scaleBand()
                          .rangeRound([0, width - margin.left - margin.right])
                          .padding(0.1)
                          .domain(fallbackData.map(d => d.Category));
                          
                        const y = d3.scaleLinear()
                          .rangeRound([height - margin.top - margin.bottom, 0])
                          .domain([0, d3.max(fallbackData, d => d.Value)]);
                          
                        g.append("g")
                          .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
                          .call(d3.axisBottom(x));
                          
                        g.append("g")
                          .call(d3.axisLeft(y).ticks(5));
                          
                        g.selectAll(".bar")
                          .data(fallbackData)
                          .enter().append("rect")
                          .attr("class", "bar")
                          .attr("x", d => x(d.Category))
                          .attr("y", d => y(d.Value))
                          .attr("width", x.bandwidth())
                          .attr("height", d => height - margin.top - margin.bottom - y(d.Value))
                          .attr("fill", "steelblue");
                          
                        debugLog('D3 fallback chart created', {});
                      } catch (d3Error) {
                        debugLog('Error creating D3 fallback chart', { 
                          message: d3Error.message 
                        });
                      }
                    }
                    
                    // Create the viz object with Muze and data functions
                    window.viz = {
                      muze: rawMuze,
                      getDataFromSearchQuery: function() {
                        try {
                          debugLog('getDataFromSearchQuery called', {});
                          
                          // Sample data for ThoughtSpot-like format
                          const data = [
                            { "Category": "Furniture", "Total Sales": 1200 },
                            { "Category": "Office Supplies", "Total Sales": 900 },
                            { "Category": "Technology", "Total Sales": 1500 },
                            { "Category": "Clothing", "Total Sales": 800 },
                            { "Category": "Books", "Total Sales": 600 }
                          ];
                          
                          debugLog('Sample data created', { rowCount: data.length });
                          
                          // Define schema in ThoughtSpot format
                          const schema = [
                            { name: "Category", type: "dimension" },
                            { name: "Total Sales", type: "measure", defAggFn: "sum" }
                          ];
                          
                          // Format data and create DataModel instance using rawMuze
                          try {
                            // Check if DataModel exists
                            if (!rawMuze.DataModel) {
                              throw new Error('DataModel is not available on the muze object');
                            }
                            
                            // Check if loadDataSync method exists
                            if (typeof rawMuze.DataModel.loadDataSync !== 'function') {
                              debugLog('loadDataSync not available, using direct DataModel constructor', {});
                              const dm = new rawMuze.DataModel(data);
                              return dm;
                            }
                            
                            // Use loadDataSync if available
                            const formattedData = rawMuze.DataModel.loadDataSync(data, schema);
                            const dm = new rawMuze.DataModel(formattedData);
                            
                            debugLog('DataModel created', { rowCount: data.length });
                            return dm;
                          } catch (dataModelError) {
                            debugLog('Error creating DataModel, returning raw data', { 
                              message: dataModelError.message,
                              stack: dataModelError.stack
                            });
                            
                            // Fallback to returning raw data
                            return data;
                          }
                        } catch (error) {
                          debugLog('Error in getDataFromSearchQuery', { 
                            message: error.message,
                            stack: error.stack
                          });
                          throw error;
                        }
                      }
                    };
                    
                    // Make debugLog available globally
                    window.debugLog = debugLog;
                    
                    // Execute the user's code
                    try {
                      debugLog('Starting user code execution', {});
                      
                      ${transformedCode}
                      
                      debugLog('User code execution completed', {});
                    } catch (error) {
                      debugLog('Error executing user code', { 
                        message: error.message,
                        stack: error.stack
                      });
                      
                      document.getElementById('chart').innerHTML = 
                        '<div class="error-container">' + 
                        '<h3>Error rendering chart:</h3>' + 
                        '<pre>' + error.message + '</pre></div>';
                    }
                  } catch (fallbackError) {
                    debugLog('Error rendering fallback chart', { 
                      message: fallbackError.message,
                      stack: fallbackError.stack
                    });
                  }
                } catch (e) {
                  debugLog('Error initializing Muze', e.message);
                }
              }
            </script>
          </head>
          <body>
            <div class="section-title">User Chart</div>
            <div id="chart"></div>
            
            <div class="section-title">Fallback Chart (Always Renders)</div>
            <div id="fallback-chart"></div>
            
            <div id="debug"></div>
          </body>
        </html>
      `;
      
      // Set the srcdoc attribute
      const iframe = iframeRef.current;
      iframe.srcdoc = htmlContent;
      
      // Add a load event listener to the iframe to capture console logs
      iframe.onload = () => {
        if (iframe.contentWindow) {
          // Listen for messages from the iframe
          const messageHandler = (event: MessageEvent) => {
            if (event.data && event.data.type === 'muze-version') {
              setMuzeVersion(event.data.version);
            }
          };
          
          window.addEventListener('message', messageHandler);
          
          // Try to access the debug div after the iframe loads
          setTimeout(() => {
            try {
              const debugContent = iframe.contentDocument?.getElementById('debug')?.innerHTML;
              if (debugContent) {
                setDebugInfo(debugContent);
              } else {
                setDebugInfo('No debug information available');
              }
            } catch (error) {
              console.error('Error accessing iframe content:', error);
              setDebugInfo('Error accessing debug information: ' + (error instanceof Error ? error.message : String(error)));
            }
          }, 1000); // Give it a second to render
          
          return () => {
            window.removeEventListener('message', messageHandler);
          };
        }
      };
      
    } catch (error) {
      console.error('Error in preview component:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="h-full w-full bg-gray-800 p-2" ref={containerRef}>
      <div className="bg-gray-700 p-2 mb-2 rounded flex justify-between items-center">
        <div className="text-xs text-gray-300">
          Muze Version: <span className="font-mono">{muzeVersion}</span>
        </div>
        <button 
          onClick={executeCode}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        >
          Run
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      <div className="h-[calc(100%-3rem)] bg-white rounded flex flex-col">
        <iframe 
          ref={iframeRef}
          className="w-full flex-grow border-0"
          title="Chart Preview"
          sandbox="allow-scripts allow-same-origin"
        />
        <div 
          className="bg-gray-100 border-t border-gray-300 p-2 text-xs font-mono overflow-auto"
          style={{ maxHeight: '30%', minHeight: '100px' }}
          dangerouslySetInnerHTML={{ __html: debugInfo }}
        />
      </div>
    </div>
  );
};

export default Preview; 
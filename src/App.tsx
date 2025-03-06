import { useState, useEffect, useCallback } from 'react'
import { generateChartCode } from './utils/openaiService'
import { getAvailablePromptKeys, getCurrentPromptKey, setCurrentPromptKey } from './utils/promptSwitcher'
import ChartRenderer from './components/ChartRenderer'
import DataSourceSwitcher from './components/DataSourceSwitcher'
import Split from 'split.js'
import './index.css'

function App() {
  const [query, setQuery] = useState('')
  const [chartCode, setChartCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [promptKeys, setPromptKeys] = useState<string[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [useThoughtSpotData, setUseThoughtSpotData] = useState(false)
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Add debug log function
  const addDebugLog = useCallback((message: string) => {
    console.log(`[App Debug] ${message}`);
    setDebugMessages(prev => [...prev, `${new Date().toISOString().substr(11, 8)}: ${message}`]);
  }, []);

  useEffect(() => {
    try {
      // Get available prompt keys
      const keys = getAvailablePromptKeys();
      setPromptKeys(keys);
      setCurrentPrompt(getCurrentPromptKey());
      addDebugLog("App initialized with prompt keys: " + keys.join(", "));

      // Initialize split.js for resizable panels
      if (document.getElementById('code-panel') && document.getElementById('chart-panel')) {
        Split(['#code-panel', '#chart-panel'], {
          sizes: [50, 50],
          minSize: [300, 300],
          gutterSize: 10,
          direction: 'horizontal',
        });
        addDebugLog("Split panels initialized");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugLog(`Error during initialization: ${errorMessage}`);
      setError(`Error during initialization: ${errorMessage}`);
    }
  }, [addDebugLog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    addDebugLog(`Submitting query: "${query}"`);
    setIsLoading(true)
    setError(null)
    setCopySuccess(false)
    setApiStatus('loading')

    try {
      addDebugLog("Generating chart code from OpenAI");
      const code = await generateChartCode(query)
      addDebugLog(`Received code from OpenAI (${code.length} characters)`);
      
      // Log a preview of the code
      const codePreview = code.length > 100 ? code.substring(0, 100) + "..." : code;
      addDebugLog(`Code preview: ${codePreview}`);
      
      setChartCode(code)
      setApiStatus('success')
      addDebugLog("Chart code set successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugLog(`Error generating chart code: ${errorMessage}`);
      setError(errorMessage || 'Failed to generate chart code')
      setApiStatus('error')
      console.error(err)
    } finally {
      setIsLoading(false)
      addDebugLog("Loading state set to false");
    }
  }

  const handleCopyCode = () => {
    if (chartCode) {
      addDebugLog("Copying chart code to clipboard");
      navigator.clipboard.writeText(chartCode)
        .then(() => {
          setCopySuccess(true)
          addDebugLog("Code copied successfully");
          setTimeout(() => setCopySuccess(false), 2000)
        })
        .catch(err => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          addDebugLog(`Failed to copy code: ${errorMessage}`);
          console.error('Failed to copy code:', err)
        })
    }
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newPromptKey = e.target.value;
      addDebugLog(`Changing prompt to: ${newPromptKey}`);
      if (setCurrentPromptKey(newPromptKey)) {
        setCurrentPrompt(newPromptKey);
        addDebugLog("Prompt changed successfully");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugLog(`Error changing prompt: ${errorMessage}`);
    }
  };

  const handleDataSourceToggle = (useThoughtSpot: boolean) => {
    try {
      addDebugLog(`Toggling data source to: ${useThoughtSpot ? 'ThoughtSpot' : 'Sample'}`);
      setUseThoughtSpotData(useThoughtSpot);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugLog(`Error toggling data source: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Muze Studio AI</h1>
              <div className="flex items-center space-x-4">
                <DataSourceSwitcher 
                  useThoughtSpotData={useThoughtSpotData} 
                  onToggle={handleDataSourceToggle} 
                />
                <div className="flex items-center space-x-2">
                  <label htmlFor="promptSelect" className="text-sm text-gray-700 dark:text-gray-300">
                    Prompt Variation:
                  </label>
                  <select
                    id="promptSelect"
                    value={currentPrompt}
                    onChange={handlePromptChange}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {promptKeys.map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe the chart you want to create..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Chart'}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {apiStatus === 'loading' && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p>Generating chart code... This may take a few moments.</p>
          </div>
        )}

        <div className="flex-1 flex split-container">
          <div id="code-panel" className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Generated Chart Code</h2>
              {chartCode && (
                <button
                  onClick={handleCopyCode}
                  className={`px-3 py-1 rounded text-sm ${copySuccess 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'}`}
                >
                  {copySuccess ? 'Copied!' : 'Copy Code'}
                </button>
              )}
            </div>
            {chartCode ? (
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto h-[calc(100%-3rem)] text-sm relative">
                <code>{chartCode}</code>
              </pre>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Enter a query above to generate chart code
              </p>
            )}
          </div>
          
          <div id="chart-panel" className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {chartCode ? (
              <ChartRenderer code={chartCode} useThoughtSpotData={useThoughtSpotData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                  Chart preview will appear here
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* App Debug Panel */}
        <div className="mt-4 bg-black bg-opacity-80 text-green-400 p-2 text-xs font-mono rounded max-h-32 overflow-y-auto">
          <div className="font-bold mb-1">App Debug Log:</div>
          {debugMessages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App 
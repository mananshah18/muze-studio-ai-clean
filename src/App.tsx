import { useState } from 'react'
import { generateChartCode } from './utils/openaiService'
import './index.css'

function App() {
  const [query, setQuery] = useState('')
  const [chartCode, setChartCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setCopySuccess(false)

    try {
      const code = await generateChartCode(query)
      setChartCode(code)
    } catch (err: any) {
      setError(err.message || 'Failed to generate chart code')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (chartCode) {
      navigator.clipboard.writeText(chartCode)
        .then(() => {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        })
        .catch(err => {
          console.error('Failed to copy code:', err)
        })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
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
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96 text-sm relative">
              <code>{chartCode}</code>
            </pre>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Enter a query above to generate chart code
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default App 
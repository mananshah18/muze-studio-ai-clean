import { useEffect, useState } from 'react';
import { mockContext, transformDataForMuze } from '../thoughtspot';
import Preview from './Preview';

interface ChartRendererProps {
  code: string;
  useThoughtSpotData?: boolean;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ code, useThoughtSpotData = false }) => {
  const [processedCode, setProcessedCode] = useState<string>(code);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

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

    try {
      // Process the code to include ThoughtSpot data if needed
      let finalCode = code;
      
      if (useThoughtSpotData) {
        addDebugLog("Transforming ThoughtSpot data");
        try {
          const thoughtSpotData = transformDataForMuze(mockContext.getChartModel());
          addDebugLog(`Transformed data has ${thoughtSpotData.length} rows`);
          
          // Modify the code to use ThoughtSpot data
          // This is a simple approach - in a real implementation, you might want to do more sophisticated code transformation
          finalCode = `// Using ThoughtSpot data
const thoughtSpotData = ${JSON.stringify(thoughtSpotData)};
const { muze } = viz;

// Create DataModel with ThoughtSpot data
const schema = [
  { name: "Category", type: "dimension" },
  { name: "Value", type: "measure", defAggFn: "sum" }
];
const formattedData = muze.DataModel.loadDataSync(thoughtSpotData, schema);
const dataModel = new muze.DataModel(formattedData);

// Create chart with ThoughtSpot data
${code}`;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          addDebugLog(`Error transforming ThoughtSpot data: ${errorMessage}`);
          setError(`Error transforming ThoughtSpot data: ${errorMessage}`);
          return;
        }
      }
      
      setProcessedCode(finalCode);
      addDebugLog("Code processed successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugLog(`Error processing code: ${errorMessage}`);
      setError(`Error processing code: ${errorMessage}`);
    }
  }, [code, useThoughtSpotData]);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 text-sm z-10">
          Error: {error}
        </div>
      )}
      <Preview code={processedCode} />
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
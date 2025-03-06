import { useEffect, useRef } from 'react';

interface ChartRendererProps {
  code: string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    // Create a sandbox iframe to render the chart
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) return;

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
          </style>
        </head>
        <body>
          <div id="chart"></div>
          <script>
            // Mock ThoughtSpot data helper function
            const viz = {
              muze: window.muze,
              getDataFromSearchQuery: function() {
                // Sample data for testing
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
                ];
              }
            };

            try {
              // Execute the generated code
              ${code}
            } catch (error) {
              console.error('Error executing chart code:', error);
              document.getElementById('chart').innerHTML = '<div style="color: red; padding: 20px;">Error rendering chart: ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    // Set the content of the iframe
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
  }, [code]);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <iframe 
        ref={iframeRef}
        title="Chart Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default ChartRenderer; 
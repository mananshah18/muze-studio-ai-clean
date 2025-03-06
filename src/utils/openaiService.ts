// OpenAI Service

import OpenAI from 'openai';

// Import OpenAI types manually since we're using it in the browser
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// System prompt for the OpenAI API (shortened for simplicity)
const SYSTEM_PROMPT = `Introduction: You are an expert in generating JavaScript code using the Muze library for creating exploratory data visualizations within ThoughtSpot's environment. Your output must always use the ThoughtSpot data model integration and follow the Muze API as documented on https://cyoc-documentation-site.vercel.app/muze/toc. Do not create sample data; always retrieve data via ThoughtSpot's helper function. Use the examples below as templates and adapt based on user input.

Core Concepts:
DataModel Purpose: The DataModel is Muze's foundation for data retrieval and transformation. In our setup, no sample data is generated. Instead, always fetch data from ThoughtSpot using the provided helper.
Usage: Always begin your code with:
const { muze, getDataFromSearchQuery } = viz;
const data = getDataFromSearchQuery();

Then, if needed, define a schema (an example is shown below):
const schema = [
  { name: 'YourDimension', type: 'dimension' },
  { name: 'YourMeasure', type: 'measure', defAggFn: 'sum' }
];
const DataModel = muze.DataModel;
const dm = new DataModel(data, schema);
Reference: https://cyoc-documentation-site.vercel.app/muze/data-model

Layers Purpose: Layers define how the data is visually represented (e.g., as columns, lines, areas, etc.) and allow stacking or overlaying of elements.
Reference: https://cyoc-documentation-site.vercel.app/muze/layers

Axes (Rows and Columns) Purpose: Axes bind fields to the chart's rows (Y‑axis) and columns (X‑axis), enabling layout configuration.
Reference: https://cyoc-documentation-site.vercel.app/muze/axes

Encodings (Color, Size, Shape) Purpose: Encodings visually differentiate data by mapping fields to attributes such as color, size, or shape.
Reference: https://cyoc-documentation-site.vercel.app/muze/encodings

Interactivity Purpose: Enables events (e.g., click, hover) and cross-chart interactions.
Reference: https://cyoc-documentation-site.vercel.app/muze/interactivity

Environment Purpose: The Environment object enables sharing of global configurations (themes, layouts) among charts.
Reference: https://cyoc-documentation-site.vercel.app/muze/environment

Styling Purpose: Customize chart appearance via CSS classes or external stylesheets.
Reference: https://cyoc-documentation-site.vercel.app/muze/styling

Chart Examples:
Example 1: Hundred Percent Stacked Area Chart
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Part%20Of%20A%20Whole/Stacked-Area-Chart
  const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();
  
  const ColumnField = "Year";
  const RowField = "Horsepower";
  const ColorField = "Origin";
  muze
    .canvas()
    .rows([RowField])
    .columns([ColumnField])
    .color(ColorField)
    .layers([
      {
        mark: "area",
        transform: { 
          type: "stack",
        },
      },
    ])
    .data(data)
    .mount("#chart") // mount your chart

Example 2: Stacked Bar Chart 
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Part%20Of%20A%20Whole/Stacked-Bar-Chart 
Code:   const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();

  const ColumnField = "Year";
  const RowField = "Horsepower";
  const ColorField = "Origin";
  muze
    .canvas()
    .rows([RowField])
    .columns([ColumnField])
    .layers([
      {
        mark: "bar",
        encoding:{
          color: ColorField,
        },
        transform: { 
          type: "stack",
        },
      },
    ])
    .data(data)
    .mount("#chart") // mount your chart 

Example 3: Donut Chart 
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Part%20Of%20A%20Whole/Donut-Chart 
Code:   const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();
  
  const AngleField = "Horsepower";
  const ColorField = "Origin";
  muze
    .canvas()
    .layers([
      {
        mark: "arc",
        encoding: {
          angle: AngleField,
          radius: {
            range: function range(_range) {
              return [_range[0] + 100, _range[1]];
            },
          },
        },
      },
    ])
    .color(ColorField)
    .data(data)
    .mount("#chart") // mount your chart

Example 4: Scatter Plot with Shapes 
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Correlation/Scatter-Plot-with-Shapes 
Code:   const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();

  const ColumnField = "Weight_in_lbs";
  const RowField = "Miles_per_Gallon";
  const ColorField = "Origin";
  const ShapeField = "Origin";
  const DetailField = "Name";


  muze
    .canvas()
    .rows([RowField])
    .columns([ColumnField])
    .detail([DetailField])
    .layers([
      {
        mark: "point",
        outline: true,
        encoding:{
            color: ColorField,
            shape: ShapeField,
        },
      },
    ])
    .data(data)
    .mount("#chart") // mount your chart
 
Example 5: Highlighted Multi-Line Chart Reference 
URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Trend%20Analysis/Highlighted-Multi-Line-Chart 
Code:   const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();

  const ColumnField = "Maker";
  const RowField = "Miles_per_Gallon";

  muze
    .canvas()
    .rows([RowField])
    .columns([ColumnField])
    .layers([
      {
        mark: "line",
        encoding:{
          color: ColumnField,
          opacity: {
            value: (d) => {
              const str = d?.datum?.dataObj[ColumnField];
              const substr = str.includes(", MI ");
              if (substr) {
                return 1;
              } else {
                return 0.1;
              }
            },
          },
        }
      },
    ])
    .config({
      legend: {
        show: false,
      },
    })
    .data(data)
    .mount("#chart") // mount your chart

Example 6: Gradient Line Chart
 Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Trend%20Analysis/Gradient-Line-Chart 
Code:   const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();

  const ColumnField = "Maker";
  const RowField = "Miles_per_Gallon";

  muze
    .canvas()
    .rows([RowField])
    .columns([ColumnField])
    .layers([
      {
        mark: "line",
        encoding:{
          color: ColumnField,
        }
      },
    ])
    .data(data)
    .mount("#chart") // mount your chart

Example 7: Bullet Chart 
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Ranking/Bullet-Chart 
Code: const { muze, getDataFromSearchQuery } = viz;
const data = getDataFromSearchQuery();

const RowField = "Maker";
const ColumnField1 = "Cumulative_Horsepower";
const ColumnField2 = "Target_Horsepower";
const ColorField = "Qualitative_Range";
const XaxisName = "Horsepower (Cumulative vs. Target)";
muze
  .canvas()
  .rows([RowField])
  .columns([
    muze.Operators.share(ColumnField1, ColumnField2),
  ])
  .layers([
    {
      mark: "bar",
      encoding: {
        x: ColumnField1,
        color: {
          value: () => "#f1f1f1",
        },
      },
    },
    {
      mark: "bar",
      encoding: {
        size: {
          value: () => 0.3,
        },
        x: ColumnField2,
        color: ColorField,
      },
    },
  ])
  .config({
    axes: {
      x: {
        name: XaxisName,
      },
    },
  })
  .data(data)
  .mount("#chart"); // mount your chart

Example 8: Heatmap 
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Distribution/Heatmap 
Code:   const { muze, getDataFromSearchQuery } = viz;
  
  const data = getDataFromSearchQuery();

  const ColumnField = "Year";
  const RowField = "Maker";
  const ColorField = "Miles_per_Gallon";
  const TextField = "Miles_per_Gallon";

  muze
    .canvas()
    .columns([ColumnField])
    .rows([RowField])
    .layers([
      {
        mark: "bar",
        encoding: {
          color: {
            field: ColorField,
          },
          text: {
            field: TextField,
            labelPlacement: {
              anchors: ["center"],
            },
          },
        },
      },
    ])
    .config({
      axes: {
        x: {
          padding: 0,
        },
        y: {
          padding: 0,
        },
      },
    })
    .data(data)
    .mount("#chart"); // mount your chart

Example 9: Histogram 
Reference URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Distribution/Histogram 
Code:   const { muze, getDataFromSearchQuery } = viz;
  
  const data = getDataFromSearchQuery();

  const ColumnField = "Horsepower(BIN)";
  const RowField = "Horsepower";

  muze
    .canvas()
    .columns([ColumnField])
    .rows([RowField])
    .layers([
      {
        mark: "bar",
        encoding: {
          color: RowField,
        },
      },
    ])
    .config({
      axes: {
        x: {
          compact: true,
          labels: {
            rotation: 0,
          },
          bins: {
            display: "startValue",
            position: "start",
          },
        },
      },
    })
    .data(data)
    .mount("#chart"); // mount your chart

Example 10: Dual Axes Chart Reference 
URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Multivariate%20Analysis/Dual-Axes-Chart 
Code:   const { muze, getDataFromSearchQuery } = viz;

  const data = getDataFromSearchQuery();

  const ColumnField = "Year";
  const RowField1 = "Miles_per_Gallon";
  const RowField2 = "Horsepower";
  const ColorField = "Origin";

  muze
    .canvas()
    .columns([ColumnField])
    .rows([[RowField1], [RowField2]])
    .layers([
      {
        mark: "bar",
        encoding: {
          y: RowField1,
          color: ColorField,
        },
      },
      {
        mark: "line",
        encoding: {
          y: RowField2,
          color: {
            value: () => "#80B1D3",
          },
        },
      },
    ])
    .data(data)
    .mount("#chart"); // mount your chart

Example 11: Waterfall Chart Reference 
URL: https://cyoc-documentation-site.vercel.app/muze/Gallery/Financial%20Analysis/Waterfall-Chart 
Code: const { muze, getDataFromSearchQuery } = viz;

const data = getDataFromSearchQuery();

const ColumnField = "month";
const RowFields = ["lowerValue", "upperValue"];
const ColorField = "type";

muze
  .canvas()
  .columns([ColumnField])
  .rows([muze.Operators.share(...RowFields)])
  .layers([
    {
      mark: "bar",
      encoding: {
        y: RowFields[1], 
        y0: RowFields[0], 
        color: ColorField,
      },
    },
  ])
  .config({
    axes: {
      x: {
        domain: data.getField(ColumnField).uniques(),
        name: "Month",
      },
      y: {
        name: "Sales",
      },
    },
  })
  .data(data)
  .mount("#chart"); // mount your chart

Final Instructions for GPT: Always use the ThoughtSpot data model snippet in the DataModel section (do not output sample data). The snippet is:
const { muze, getDataFromSearchQuery } = viz;
const data = getDataFromSearchQuery();

Reference the code examples given above for the chart types based on user-specified configurations. Adapt the example codes as needed based on user input (e.g., change axis fields, encodings, or configuration options) while ensuring adherence to Muze's API and ThoughtSpot integration. Always generate valid, optimized, and well-formatted JavaScript code.`;

/**
 * Processes the OpenAI response to extract only the code part
 * @param response The raw response from OpenAI
 * @returns The extracted code
 */
function extractCodeFromResponse(response: string): string {
  // If the response is already just code, return it as is
  if (response.trim().startsWith('const') || response.trim().startsWith('// Get')) {
    return response;
  }
  
  // Try to extract code blocks
  const codeBlockRegex = /```(?:javascript|js)?\s*([\s\S]*?)```/;
  const match = response.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no code block found, return the original response
  return response;
}

/**
 * Makes a direct fetch request to Azure OpenAI API
 * @param query The natural language query
 * @param apiKey The Azure OpenAI API key
 * @param endpoint The Azure OpenAI endpoint
 * @param deploymentId The Azure OpenAI deployment ID
 * @param apiVersion The Azure OpenAI API version
 * @returns The generated code
 */
async function callAzureOpenAI(
  query: string,
  apiKey: string,
  endpoint: string,
  deploymentId: string,
  apiVersion: string
): Promise<string> {
  const url = `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;
  
  console.log('Making request to:', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Azure OpenAI API error:', errorText);
    throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Azure OpenAI response:', data);
  
  const generatedCode = data.choices[0]?.message?.content || '';
  return extractCodeFromResponse(generatedCode);
}

/**
 * Generates Muze chart code based on a natural language query using Azure OpenAI
 * @param query The natural language query describing the desired chart
 * @returns The generated Muze chart code
 */
export async function generateChartCode(query: string): Promise<string> {
  try {
    // Debug all environment variables
    console.log('All import.meta.env values:', {
      VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? 'Exists (not showing for security)' : 'Not found',
      VITE_OPENAI_ENDPOINT: import.meta.env.VITE_OPENAI_ENDPOINT,
      VITE_OPENAI_API_TYPE: import.meta.env.VITE_OPENAI_API_TYPE,
      VITE_OPENAI_DEPLOYMENT_ID: import.meta.env.VITE_OPENAI_DEPLOYMENT_ID,
      VITE_OPENAI_API_VERSION: import.meta.env.VITE_OPENAI_API_VERSION,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const endpoint = import.meta.env.VITE_OPENAI_ENDPOINT;
    const apiType = import.meta.env.VITE_OPENAI_API_TYPE;
    const deploymentId = import.meta.env.VITE_OPENAI_DEPLOYMENT_ID;
    const apiVersion = import.meta.env.VITE_OPENAI_API_VERSION || '2024-08-01-preview';
    
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Type:', apiType);
    console.log('Endpoint:', endpoint);
    console.log('Deployment ID:', deploymentId);
    console.log('API Version:', apiVersion);
    
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    if (apiType === 'azure') {
      if (!endpoint) {
        throw new Error('Azure OpenAI endpoint is not configured. Please set VITE_OPENAI_ENDPOINT in your .env file.');
      }
      
      if (!deploymentId) {
        throw new Error('Azure OpenAI deployment ID is not configured. Please set VITE_OPENAI_DEPLOYMENT_ID in your .env file.');
      }
      
      // Use direct fetch for Azure OpenAI
      return await callAzureOpenAI(query, apiKey, endpoint, deploymentId, apiVersion);
    }
    
    // For standard OpenAI API
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Only for client-side use
    });
    
    console.log('OpenAI client initialized');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    console.log('Response received');
    
    const generatedCode = response.choices[0]?.message?.content || '';
    return extractCodeFromResponse(generatedCode);
  } catch (error: any) {
    console.error('Error generating chart code:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to generate chart code: ${error.message}`);
  }
}

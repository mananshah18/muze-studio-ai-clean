import {
  ChartConfig,
  ChartModel,
  ChartToTSEvent,
  ColumnType,
  CustomChartContext,
  DataType,
  ChartSpecificColumnType,
  Query,
  TSToChartEvent,
  VisualPropEditorDefinition,
  ChartColumn,
  ChartData
} from './types';

// Mock sample data for testing
const sampleColumns: ChartColumn[] = [
  {
    id: 'col1',
    name: 'Sales',
    type: ColumnType.MEASURE,
    dataType: DataType.NUMBER,
    chartSpecificColumnType: ChartSpecificColumnType.NONE
  },
  {
    id: 'col2',
    name: 'Region',
    type: ColumnType.ATTRIBUTE,
    dataType: DataType.STRING,
    chartSpecificColumnType: ChartSpecificColumnType.NONE
  },
  {
    id: 'col3',
    name: 'Date',
    type: ColumnType.DATE,
    dataType: DataType.DATE,
    chartSpecificColumnType: ChartSpecificColumnType.NONE
  }
];

const sampleData: ChartData = {
  columns: sampleColumns,
  data: [
    [1000, 2000, 3000, 4000],
    ['North', 'South', 'East', 'West'],
    ['2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01']
  ]
};

const sampleChartModel: ChartModel = {
  columns: sampleColumns,
  data: [sampleData]
};

// Mock implementation of the ThoughtSpot SDK context
class MockChartContext implements CustomChartContext {
  private chartModel: ChartModel;
  private eventHandlers: Map<string, ((payload: any) => any)[]> = new Map();

  constructor(chartModel: ChartModel = sampleChartModel) {
    this.chartModel = chartModel;
  }

  getChartModel(): ChartModel {
    return this.chartModel;
  }

  getAppConfig(): any {
    return {
      appOptions: {
        isDebugMode: true
      },
      styleConfig: {
        numColorPalettes: 5,
        chartColorPalettes: [
          {
            colors: [
              '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
              '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
            ]
          }
        ]
      }
    };
  }

  async emitEvent(eventType: ChartToTSEvent, payload?: any): Promise<void> {
    console.log(`Emitting event: ${eventType}`, payload);
    // In a real implementation, this would communicate with ThoughtSpot
  }

  on(eventType: TSToChartEvent, callback: (payload: any) => any): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(callback);
  }

  // Helper method to trigger events (for testing)
  triggerEvent(eventType: TSToChartEvent, payload: any): any {
    const handlers = this.eventHandlers.get(eventType) || [];
    let result = undefined;
    
    for (const handler of handlers) {
      result = handler(payload);
    }
    
    return result;
  }
}

// Mock implementation of getChartContext
export async function getChartContext(options: {
  getDefaultChartConfig: (chartModel: ChartModel) => ChartConfig[];
  getQueriesFromChartConfig: (chartConfig: ChartConfig[], chartModel?: ChartModel) => Query[];
  renderChart: (context: CustomChartContext) => Promise<void>;
  chartConfigEditorDefinition?: any[];
  visualPropEditorDefinition?: VisualPropEditorDefinition;
  allowedConfigurations?: any;
}): Promise<CustomChartContext> {
  // Create a mock context
  const context = new MockChartContext();
  
  // Call the renderChart function with the mock context
  await options.renderChart(context);
  
  return context;
}

// Helper functions for working with ThoughtSpot data
export function getMeasureCols(columns: ChartColumn[]) {
  return columns.filter(col => col.type === ColumnType.MEASURE);
}

export function getAttributeCols(columns: ChartColumn[]) {
  return columns.filter(col => col.type === ColumnType.ATTRIBUTE);
}

export function getDateCols(columns: ChartColumn[]) {
  return columns.filter(col => col.type === ColumnType.DATE);
}

// Export the mock context for testing
export const mockContext = new MockChartContext(); 
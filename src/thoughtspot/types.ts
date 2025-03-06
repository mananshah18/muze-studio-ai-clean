// ThoughtSpot SDK Types
// These are mock types based on the ThoughtSpot Charts SDK

export enum ColumnType {
  MEASURE = 'MEASURE',
  ATTRIBUTE = 'ATTRIBUTE',
  DATE = 'DATE',
  UNKNOWN = 'UNKNOWN'
}

export enum DataType {
  DATE = 'DATE',
  TIME = 'TIME',
  DATE_TIME = 'DATE_TIME',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  UNKNOWN = 'UNKNOWN'
}

export enum ChartSpecificColumnType {
  MEASURE_VALUES = 'MEASURE_VALUES',
  MEASURE_NAMES = 'MEASURE_NAMES',
  NONE = 'NONE'
}

export interface ChartColumn {
  id: string;
  name: string;
  type: ColumnType;
  dataType: DataType;
  chartSpecificColumnType: ChartSpecificColumnType;
}

export interface ChartData {
  columns: ChartColumn[];
  data: any[][];
}

export interface ChartModel {
  columns: ChartColumn[];
  data: ChartData[];
}

export interface Query {
  queryColumns: ChartColumn[];
  queryParams?: {
    size?: number;
  };
}

export interface ChartConfig {
  key: string;
  dimensions: {
    key: string;
    columns: ChartColumn[];
  }[];
}

export enum ChartToTSEvent {
  RenderStart = 'RenderStart',
  RenderError = 'RenderError',
  RenderComplete = 'RenderComplete',
  UpdateVisualProps = 'UpdateVisualProps'
}

export enum TSToChartEvent {
  VisualPropsUpdate = 'VisualPropsUpdate',
  DataUpdate = 'DataUpdate',
  ConfigUpdate = 'ConfigUpdate'
}

export interface CustomChartContext {
  getChartModel(): ChartModel;
  getAppConfig(): any;
  emitEvent(eventType: ChartToTSEvent, payload?: any): Promise<void>;
  on(eventType: TSToChartEvent, callback: (payload: any) => any): void;
}

export interface VisualPropEditorDefinition {
  elements: any[];
} 
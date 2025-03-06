import { CustomChartContext } from '@thoughtspot/ts-chart-sdk';
import { getAttributeCols, getMeasureCols } from '../helpers';

export function generateDefaultJsCodeSample(ctx: CustomChartContext): string {
    const allCols = ctx.getChartModel().columns.slice();
    const measureCols = getMeasureCols(allCols);
    const attributeCols = getAttributeCols(allCols);

    const rows = measureCols.slice(0, 1);
    const columns = attributeCols.slice(0, 1);

    const rowsStr = rows.map((x) => `"${x.name}"`).join(',');
    const columnsStr = columns.map((x) => `"${x.name}"`).join(',');

    const codeSample = `const { muze, getDataFromSearchQuery } = viz;
  
const data = getDataFromSearchQuery();

muze.canvas()
.rows([${rowsStr}])
.columns([${columnsStr}])
.data(data)
.mount("#chart")
`;

    return codeSample;
}

export function generateDefaultCSSCodeSample(): string {
    return `html, body {
    margin: 0;
    padding: 0;
}

#chart {
    width: 100vw;
    height: 100vh;
}`;
}

export function generateDefaultHTMLCodeSample(): string {
    return `<div id="chart"></div>`;
}

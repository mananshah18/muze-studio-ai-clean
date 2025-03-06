/**
 * Transforms user code to be safely executed in the preview iframe
 * @param code The user-provided code
 * @returns Transformed code ready for execution
 */
export function transformCode(code: string): string {
  // Replace require statements with window.Muze
  let transformedCode = code.replace(/const\s+(?:env|muze)\s*=\s*require\s*\(\s*['"]@viz\/muze['"]\s*\)/g, 'const env = window.viz.muze');
  transformedCode = transformedCode.replace(/const\s+Muze\s*=\s*env\.Muze/g, 'const Muze = window.viz.muze');
  
  // Replace viz references if needed
  transformedCode = transformedCode.replace(/const\s+{\s*muze\s*,\s*getDataFromSearchQuery\s*}\s*=\s*viz\s*;/g, 'const { muze, getDataFromSearchQuery } = window.viz;');
  transformedCode = transformedCode.replace(/const\s+{\s*muze\s*,\s*getDataFromSearchQuery\s*}\s*=\s*thoughtspot\s*;/g, 'const { muze, getDataFromSearchQuery } = window.viz;');
  
  // Handle mount('#chart-container') pattern - ensure it targets #chart and add responsive handling
  transformedCode = transformedCode.replace(
    /(\.\s*mount\s*\(\s*['"]#[\w-]+['"]\s*\))/g, 
    (_, mountCall) => {
      // Replace with mount call
      return `${mountCall}`;
    }
  );
  
  // Handle ThoughtSpot specific patterns
  transformedCode = transformedCode.replace(/thoughtspot\.getDataFromSearchQuery/g, 'window.viz.getDataFromSearchQuery');
  transformedCode = transformedCode.replace(/thoughtspot\.muze/g, 'window.viz.muze');
  
  // Handle ThoughtSpot Charts SDK specific imports
  transformedCode = transformedCode.replace(/import\s+{\s*.*?\s*}\s+from\s+['"]@thoughtspot\/ts-chart-sdk['"]\s*;/g, '// ThoughtSpot SDK imports handled internally');
  
  // Handle ChartContext initialization
  transformedCode = transformedCode.replace(/getChartContext\s*\(/g, '// getChartContext handled internally: ');
  
  // Ensure viz is properly referenced
  if (!transformedCode.includes('window.viz') && !transformedCode.includes('const { muze, getDataFromSearchQuery }')) {
    // If code doesn't already have a viz reference, add it at the beginning
    transformedCode = 'const { muze, getDataFromSearchQuery } = window.viz;\n' + transformedCode;
  }
  
  // Add semicolons to the end of lines if missing
  transformedCode = transformedCode.split('\n')
    .map(line => {
      const trimmedLine = line.trim();
      if (
        trimmedLine.length > 0 &&
        !trimmedLine.endsWith(';') &&
        !trimmedLine.endsWith('{') &&
        !trimmedLine.endsWith('}') &&
        !trimmedLine.endsWith(',') &&
        !trimmedLine.startsWith('//') &&
        !trimmedLine.startsWith('/*') &&
        !trimmedLine.startsWith('*') &&
        !trimmedLine.startsWith('import ') &&
        !trimmedLine.startsWith('export ')
      ) {
        return line + ';';
      }
      return line;
    })
    .join('\n');
  
  return transformedCode;
} 
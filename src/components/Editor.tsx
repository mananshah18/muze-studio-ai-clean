import React from 'react';
// Removing unused import that causes TypeScript error
// import MonacoEditor from 'react-monaco-editor';

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ code, onChange }) => {
  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: true,
    readOnly: false,
    cursorStyle: 'line' as 'line',
    automaticLayout: true,
    minimap: {
      enabled: false
    }
  };

  return (
    <div className="h-full w-full overflow-hidden bg-gray-900">
      <div className="h-full w-full">
        {/* Replacing MonacoEditor with a simple textarea for now */}
        <textarea
          className="w-full h-full p-4 bg-gray-900 text-white font-mono"
          value={code}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Editor; 
import React from 'react';

declare module './Preview' {
  interface PreviewProps {
    code: string;
  }
  
  const Preview: React.FC<PreviewProps>;
  export default Preview;
}

declare module './Editor' {
  interface EditorProps {
    code: string;
    onChange: (value: string) => void;
  }
  
  const Editor: React.FC<EditorProps>;
  export default Editor;
}

declare module './Header' {
  const Header: React.FC;
  export default Header;
} 
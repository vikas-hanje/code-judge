import dynamic from 'next/dynamic';
import { useTheme } from '../contexts/ThemeContext';

// Monaco Editor loaded client-side only
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Props = {
  language: string;
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
};

export default function Editor({ language, value, onChange, onRun, onSubmit }: Props) {
  const { theme } = useTheme();
  
  // Keyboard shortcut support depends on Monaco onMount
  function handleMount(editor: any, monaco: any) {
    const runCommand = () => onRun && onRun();
    const submitCommand = () => onSubmit && onSubmit();
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCommand);
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, submitCommand);
  }

  return (
    <div className="h-[60vh] w-full overflow-hidden rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
      <MonacoEditor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        value={value}
        onChange={(v) => onChange(v || '')}
        options={{ 
          minimap: { enabled: false }, 
          fontSize: 14, 
          scrollBeyondLastLine: false,
          automaticLayout: true
        }}
        onMount={handleMount}
      />
    </div>
  );
}

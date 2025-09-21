import ReactMarkdown from 'react-markdown';

type Sample = { id: number; input: string; expected_output: string };

type Props = {
  title: string;
  statement: string;
  samples?: Sample[];
  sampleResults?: { [key: number]: { stdout: string; status: string } };
};

export default function ProblemView({ title, statement, samples = [], sampleResults }: Props) {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <h1 style={{ color: 'rgb(var(--fg))' }}>{title}</h1>
      <div style={{ color: 'rgb(var(--fg))' }}>
        <ReactMarkdown 
          components={{
            h1: () => null, // Skip H1 headings since we already have the title
            h2: ({ children }) => {
              // Skip H2 headings that match the title
              const childText = children?.toString() || '';
              if (childText === title) return null;
              return <h2 style={{ color: 'rgb(var(--fg))' }}>{children}</h2>;
            },
            h3: ({ children }) => <h3 style={{ color: 'rgb(var(--fg))' }}>{children}</h3>,
            h4: ({ children }) => <h4 style={{ color: 'rgb(var(--fg))' }}>{children}</h4>,
            p: ({ children }) => <p style={{ color: 'rgb(var(--fg))' }}>{children}</p>,
            strong: ({ children }) => <strong style={{ color: 'rgb(var(--fg))' }}>{children}</strong>,
            li: ({ children }) => <li style={{ color: 'rgb(var(--fg))' }}>{children}</li>,
            ul: ({ children }) => <ul style={{ color: 'rgb(var(--fg))' }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ color: 'rgb(var(--fg))' }}>{children}</ol>,
          }}
        >
          {statement}
        </ReactMarkdown>
      </div>
      {samples.length > 0 && (
        <section>
          <h3 style={{ color: 'rgb(var(--fg))' }}>Sample Tests</h3>
          <div className="grid grid-cols-1 gap-3">
            {samples.map((s, index) => (
              <div key={s.id} className="card">
                <h4 className="mb-2 font-semibold">Sample {index + 1}</h4>
                <div className="grid grid-cols-1 gap-3 text-sm lg:grid-cols-3">
                  <div>
                    <div className="label">Input</div>
                    <pre className="whitespace-pre-wrap rounded border p-2 text-xs" style={{ borderColor: 'rgb(var(--border))', backgroundColor: 'rgb(var(--input-bg))', color: 'rgb(var(--fg))' }}>{s.input}</pre>
                  </div>
                  <div>
                    <div className="label">Expected Output</div>
                    <pre className="whitespace-pre-wrap rounded border p-2 text-xs" style={{ borderColor: 'rgb(var(--border))', backgroundColor: 'rgb(var(--input-bg))', color: 'rgb(var(--fg))' }}>{s.expected_output}</pre>
                  </div>
                  {sampleResults && sampleResults[s.id] && (
                    <div>
                      <div className="label">Your Output</div>
                      <pre className={`whitespace-pre-wrap rounded border p-2 text-xs ${
                        sampleResults[s.id].stdout?.trim() === s.expected_output?.trim() 
                          ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' 
                          : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
                      }`}>
                        {sampleResults[s.id].stdout || '(no output)'}
                      </pre>
                      <div className={`mt-1 text-xs font-medium ${
                        sampleResults[s.id].stdout?.trim() === s.expected_output?.trim()
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {sampleResults[s.id].status?.includes('Runtime Error') || sampleResults[s.id].status?.includes('NZEC') 
                          ? '⚠ Runtime Error (NZEC)' 
                          : sampleResults[s.id].stdout?.trim() === s.expected_output?.trim() 
                          ? '✓ Passed' 
                          : '✗ Failed'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

'use client'

import { useState, useCallback } from 'react'

type ConversionType = 'html-to-python' | 'python-to-html' | 'exe-to-python' | 'packed-to-unpacked' | 'unpacked-to-packed' | 'zip-to-folder' | 'nextjs-to-python'

const conversionOptions: { id: ConversionType; label: string; description: string; icon: string; accept: string }[] = [
  { id: 'html-to-python', label: 'HTML/CSS/JS → Python', description: 'Convert web code to PyQt5 or PyWebView', icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z', accept: '.html,.htm,.css,.js' },
  { id: 'python-to-html', label: 'Python → HTML/CSS/JS', description: 'Convert PyQt5/Tkinter to web code', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', accept: '.py' },
  { id: 'exe-to-python', label: 'EXE → Python', description: 'Decompile EXE back to Python source', icon: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z', accept: '.exe' },
  { id: 'packed-to-unpacked', label: 'Packed → Unpacked EXE', description: 'Unpack a packed EXE file', icon: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z', accept: '.exe' },
  { id: 'unpacked-to-packed', label: 'Unpacked → Packed EXE', description: 'Pack an unpacked EXE file', icon: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z', accept: '.exe' },
  { id: 'zip-to-folder', label: 'ZIP → Folder', description: 'Extract ZIP to organized folder', icon: 'M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z', accept: '.zip' },
  { id: 'nextjs-to-python', label: 'Next.js → Python', description: 'Convert Next.js app to Flask/Django', icon: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z', accept: '' },
]

export default function Home() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [conversionType, setConversionType] = useState<ConversionType>('html-to-python')
  const [mode, setMode] = useState<'pywebview' | 'pyqt'>('pyqt')
  const [gitUrl, setGitUrl] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const currentOption = conversionOptions.find(o => o.id === conversionType)!
  const isBinaryMode = conversionType === 'exe-to-python' || conversionType === 'packed-to-unpacked' || conversionType === 'unpacked-to-packed' || conversionType === 'zip-to-folder'
  const isFolderMode = conversionType === 'nextjs-to-python'

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      if (isBinaryMode) {
        setUploadedFileName(files[0].name)
        setInput(files[0].name)
      } else {
        const fileNames = Array.from(files).map(f => f.name)
        setUploadedFiles(fileNames)
        
        // Read all files
        const reader = new FileReader()
        reader.onload = (event) => {
          setInput(event.target?.result as string)
        }
        reader.readAsText(files[0])
      }
    }
  }, [isBinaryMode])

  const convert = async () => {
    if (!input && !gitUrl) {
      setError('Please provide input code or upload a file')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setOutput('')

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input, 
          mode, 
          conversionType,
          gitUrl,
          fileName: uploadedFileName,
          files: uploadedFiles
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed')
      }

      setOutput(data.output)
      setSuccess('Conversion completed successfully!')
    } catch (err: any) {
      setError(err.message || 'An error occurred during conversion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const downloadOutput = () => {
    const ext = conversionType.includes('python') && conversionType !== 'exe-to-python' ? 'py' : conversionType.includes('html') ? 'html' : 'txt'
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setSuccess('')
    setGitUrl('')
    setUploadedFileName('')
    setUploadedFiles([])
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem',
      fontFamily: '"DM Sans", system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0
            }}>
              AlinSoft
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
            Universal Code & File Converter
          </p>
        </header>

        {/* Conversion Type Selector */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
            Select Conversion Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {conversionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => { setConversionType(option.id); setInput(''); setUploadedFileName(''); setUploadedFiles([]); }}
                style={{
                  background: conversionType === option.id ? '#2563eb' : '#f1f5f9',
                  border: conversionType === option.id ? '2px solid #2563eb' : '2px solid transparent',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={conversionType === option.id ? '#fff' : '#64748b'}>
                    <path d={option.icon} />
                  </svg>
                  <span style={{ 
                    fontWeight: 600, 
                    color: conversionType === option.id ? '#fff' : '#1e293b',
                    fontSize: '0.8rem'
                  }}>
                    {option.label}
                  </span>
                </div>
                <p style={{ 
                  color: conversionType === option.id ? 'rgba(255,255,255,0.8)' : '#64748b', 
                  fontSize: '0.7rem', 
                  margin: 0 
                }}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection for HTML to Python */}
        {conversionType === 'html-to-python' && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Output Mode:</span>
            <button
              onClick={() => setMode('pyqt')}
              style={{
                background: mode === 'pyqt' ? '#2563eb' : '#e2e8f0',
                border: 'none',
                color: mode === 'pyqt' ? '#fff' : '#475569',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              PyQt5 (Native GUI)
            </button>
            <button
              onClick={() => setMode('pywebview')}
              style={{
                background: mode === 'pywebview' ? '#2563eb' : '#e2e8f0',
                border: 'none',
                color: mode === 'pywebview' ? '#fff' : '#475569',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              PyWebView (Web Wrapper)
            </button>
          </div>
        )}

        {/* Git Clone Option */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          <input
            type="text"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            placeholder="Or clone a Git repository URL..."
            style={{
              flex: 1,
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              outline: 'none',
              color: '#1e293b'
            }}
          />
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Input Section */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Input</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <label style={{
                  background: '#f1f5f9',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {isFolderMode ? 'Upload Folder' : 'Upload File'}
                  <input
                    type="file"
                    accept={currentOption.accept}
                    multiple={isFolderMode}
                    /* @ts-expect-error webkitdirectory is valid for folder upload */
                    webkitdirectory={isFolderMode ? '' : undefined}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  onClick={clearAll}
                  style={{
                    background: '#fee2e2',
                    border: 'none',
                    color: '#dc2626',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Show uploaded file names for binary/folder modes */}
            {(isBinaryMode || isFolderMode) && (uploadedFileName || uploadedFiles.length > 0) && (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                color: '#0369a1',
                fontSize: '0.875rem'
              }}>
                <strong>Uploaded:</strong> {uploadedFileName || uploadedFiles.join(', ')}
              </div>
            )}

            <textarea
              value={isBinaryMode ? '' : input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isBinaryMode 
                  ? "Upload a file using the button above..."
                  : isFolderMode
                    ? "Upload a folder using the button above..."
                    : "Paste your code here or upload a file..."
              }
              disabled={isBinaryMode || isFolderMode}
              style={{
                width: '100%',
                height: '350px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                color: '#1e293b',
                padding: '1rem',
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: '0.85rem',
                resize: 'vertical',
                outline: 'none',
                opacity: (isBinaryMode || isFolderMode) ? 0.5 : 1
              }}
            />

            {/* Status Messages */}
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#dc2626',
                marginTop: '1rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#16a34a',
                marginTop: '1rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {success}
              </div>
            )}

            {/* Convert Button */}
            <button
              onClick={convert}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '1rem',
                background: loading ? '#94a3b8' : '#2563eb',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                  </svg>
                  Converting...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                  </svg>
                  Convert Now
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Output</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {output && (
                  <>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#475569',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={downloadOutput}
                      style={{
                        background: '#2563eb',
                        border: 'none',
                        color: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </button>
                  </>
                )}
              </div>
            </div>

            <textarea
              value={output}
              readOnly
              placeholder="Converted code will appear here..."
              style={{
                flex: 1,
                minHeight: '350px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#e2e8f0',
                padding: '1rem',
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: '0.85rem',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          <p>AlinSoft — Universal Code & File Converter</p>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}

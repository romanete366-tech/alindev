'use client'

import { useState, useCallback } from 'react'

export default function Home() {
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')
  const [js, setJs] = useState('')
  const [python, setPython] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html')

  const handleFileUpload = useCallback((type: 'html' | 'css' | 'js') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (type === 'html') setHtml(content)
        else if (type === 'css') setCss(content)
        else setJs(content)
      }
      reader.readAsText(file)
    }
  }, [])

  const convert = async () => {
    if (!html && !css && !js) {
      setError('Please provide at least HTML, CSS, or JavaScript code')
      return
    }

    setLoading(true)
    setError('')
    setPython('')

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css, js })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed')
      }

      setPython(data.python)
    } catch (err: any) {
      setError(err.message || 'An error occurred during conversion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(python)
  }

  const downloadPython = () => {
    const blob = new Blob([python], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted.py'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setHtml('')
    setCss('')
    setJs('')
    setPython('')
    setError('')
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            🐍 Web to Python Converter
          </h1>
          <p style={{ color: '#8892b0', fontSize: '1.1rem' }}>
            Convert HTML, CSS, and JavaScript files into Python code
          </p>
        </header>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Input Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>📥 Input Code</h2>
              <button
                onClick={clearAll}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#8892b0',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Clear All
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {(['html', 'css', 'js'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? 'linear-gradient(90deg, #00d9ff, #00ff88)' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: activeTab === tab ? '#1a1a2e' : '#8892b0',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {tab === 'js' ? 'JavaScript' : tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeTab === 'html' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: '#ff6b6b', fontSize: '0.875rem' }}>{'<HTML>'}</label>
                    <label style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#8892b0',
                      fontSize: '0.75rem'
                    }}>
                      📁 Upload File
                      <input
                        type="file"
                        accept=".html,.htm"
                        onChange={handleFileUpload('html')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="Paste your HTML code here or upload a file..."
                    style={{
                      width: '100%',
                      height: '200px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#e6f1ff',
                      padding: '1rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </>
              )}

              {activeTab === 'css' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: '#64ffda', fontSize: '0.875rem' }}>CSS</label>
                    <label style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#8892b0',
                      fontSize: '0.75rem'
                    }}>
                      📁 Upload File
                      <input
                        type="file"
                        accept=".css"
                        onChange={handleFileUpload('css')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <textarea
                    value={css}
                    onChange={(e) => setCss(e.target.value)}
                    placeholder="Paste your CSS code here or upload a file..."
                    style={{
                      width: '100%',
                      height: '200px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#e6f1ff',
                      padding: '1rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </>
              )}

              {activeTab === 'js' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: '#f7df1e', fontSize: '0.875rem' }}>JavaScript</label>
                    <label style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#8892b0',
                      fontSize: '0.75rem'
                    }}>
                      📁 Upload File
                      <input
                        type="file"
                        accept=".js"
                        onChange={handleFileUpload('js')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <textarea
                    value={js}
                    onChange={(e) => setJs(e.target.value)}
                    placeholder="Paste your JavaScript code here or upload a file..."
                    style={{
                      width: '100%',
                      height: '200px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#e6f1ff',
                      padding: '1rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </>
              )}
            </div>

            {/* Status */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {html && <span style={{ background: 'rgba(255, 107, 107, 0.2)', color: '#ff6b6b', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>HTML ✓</span>}
              {css && <span style={{ background: 'rgba(100, 255, 218, 0.2)', color: '#64ffda', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>CSS ✓</span>}
              {js && <span style={{ background: 'rgba(247, 223, 30, 0.2)', color: '#f7df1e', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>JS ✓</span>}
            </div>

            {/* Convert Button */}
            <button
              onClick={convert}
              disabled={loading || (!html && !css && !js)}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '1rem',
                background: loading || (!html && !css && !js)
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'linear-gradient(90deg, #00d9ff, #00ff88)',
                border: 'none',
                borderRadius: '12px',
                color: loading || (!html && !css && !js) ? '#8892b0' : '#1a1a2e',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading || (!html && !css && !js) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '⏳ Converting...' : '🐍 Convert to Python'}
            </button>
          </div>

          {/* Output Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>📤 Python Output</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {python && (
                  <>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: '#8892b0',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={downloadPython}
                      style={{
                        background: 'rgba(0, 217, 255, 0.2)',
                        border: 'none',
                        color: '#00d9ff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      💾 Download .py
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ color: '#64ffda', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {'# Python'}
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                color: '#ff6b6b',
                marginBottom: '1rem'
              }}>
                ❌ {error}
              </div>
            )}

            <textarea
              value={python}
              readOnly
              placeholder="Python code will appear here after conversion..."
              style={{
                flex: 1,
                minHeight: '300px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#e6f1ff',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', marginTop: '2rem', color: '#8892b0', fontSize: '0.875rem' }}>
          <p>Upload or paste your web code and convert it to Python instantly</p>
        </footer>
      </div>
    </main>
  )
}

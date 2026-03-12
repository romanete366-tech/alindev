import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, mode, conversionType, gitUrl, fileName, files } = body

    if (!input && !gitUrl && !fileName && (!files || files.length === 0)) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 })
    }

    const zai = await ZAI.create()

    let prompt: string
    let systemPrompt: string

    switch (conversionType) {
      case 'html-to-python':
        if (mode === 'pywebview') {
          prompt = `Convert this web code to a Python application using PyWebView.

${input}

STRICT RULES:
1. Output ONE complete, executable Python script
2. Use webview.create_window() to display the HTML content
3. Embed all CSS inside <style> tags in the HTML
4. Convert JavaScript functions to Python methods and expose them via webview.api class
5. Implement localStorage using JSON file storage in appdata folder
6. The app MUST run immediately with: python filename.py
7. Add comment at top: # Build: pyinstaller --noconsole --onefile script.py
8. NO markdown blocks, ONLY Python code

Generate now:`

          systemPrompt = `You are a Python expert creating PyWebView desktop applications. Output ONLY valid Python code, no markdown.`
        } else {
          prompt = `Convert this HTML/CSS/JS to a PyQt5 GUI application.

${input}

RULES:
1. Output ONE complete, executable Python script
2. Map HTML elements to PyQt5 widgets:
   - <div>, <section> → QFrame/QWidget with layout
   - <h1>-<h6>, <p>, <span> → QLabel
   - <button> → QPushButton with clicked.connect()
   - <input>, <textarea> → QLineEdit/QTextEdit
   - <ul>/<ol> → QListWidget
   - <form> → QWidget with layout
3. Convert CSS to setStyleSheet() calls
4. Convert JavaScript to Python methods with signals/slots
5. Implement localStorage using JSON file in appdata folder
6. Add: # Build: pyinstaller --noconsole --onefile script.py
7. NO markdown, ONLY Python code

Generate now:`

          systemPrompt = `You convert HTML/CSS/JS to PyQt5 GUI applications. Output ONLY Python code, no markdown.`
        }
        break

      case 'python-to-html':
        prompt = `Convert this Python PyQt5/Tkinter code to HTML/CSS/JavaScript.

${input}

RULES:
1. Output a single HTML file with embedded CSS and JavaScript
2. Map PyQt5/Tkinter widgets to HTML:
   - QLabel → <p>, <h1>-<h6>, <span>
   - QPushButton → <button>
   - QLineEdit/QTextEdit → <input>, <textarea>
   - QListWidget → <ul>/<ol>
   - QFrame/QWidget → <div>
3. Convert setStyleSheet() to CSS in <style> tags
4. Convert Python methods to JavaScript functions
5. Keep the same functionality and appearance
6. NO markdown, ONLY HTML code

Generate now:`

        systemPrompt = `You convert Python GUI code to HTML/CSS/JS. Output ONLY HTML code, no markdown.`
        break

      case 'exe-to-python':
        prompt = `Generate Python source code for decompiling an EXE file.

File: ${fileName || 'unknown.exe'}

Provide a complete Python script that:
1. Uses pyinstxtractor to extract PyInstaller EXE
2. Uses uncompyle6 or decompyle3 to decompile .pyc files
3. Reconstructs the original Python source
4. Handles common packers and protectors

Include:
- All necessary imports
- Step-by-step extraction process
- Error handling
- Output file organization

Add comment: # pip install pyinstxtractor uncompyle6 pefile

NO markdown, ONLY Python code.`

        systemPrompt = `You are a reverse engineering expert. Create Python scripts for EXE decompilation. Output ONLY Python code.`
        break

      case 'packed-to-unpacked':
        prompt = `Create a Python script to unpack a packed EXE file.

File: ${fileName || 'unknown.exe'}

Generate a comprehensive unpacking script that:
1. Detects the packer (UPX, Themida, VMProtect, ASPack, etc.)
2. Unpacks the executable
3. Rebuilds the import table
4. Saves the unpacked EXE

Include:
- Packer detection logic
- Multiple unpacker support
- pefile usage for PE analysis
- Error handling

Add comment: # pip install pefile capstone

NO markdown, ONLY Python code.`

        systemPrompt = `You are a malware analyst and reverse engineer. Create EXE unpacking scripts. Output ONLY Python code.`
        break

      case 'unpacked-to-packed':
        prompt = `Create a Python script to pack an EXE file.

File: ${fileName || 'unknown.exe'}

Generate a script that:
1. Packs the EXE using UPX or similar
2. Optionally converts Python scripts to standalone EXE
3. Applies compression and protection
4. Creates the final packed executable

Include:
- PyInstaller integration
- UPX compression
- Custom icon and metadata support
- Build command generation

Add comment: # pip install pyinstaller, download UPX from upx.github.io

NO markdown, ONLY Python code.`

        systemPrompt = `You create Python scripts for packing and protecting executables. Output ONLY Python code.`
        break

      case 'zip-to-folder':
        prompt = `Create a Python script to extract and organize a ZIP file.

File: ${fileName || 'archive.zip'}

Generate a script that:
1. Extracts ZIP contents to a folder
2. Organizes files by type (images, documents, code, etc.)
3. Handles nested ZIPs recursively
4. Creates a clean folder structure
5. Reports extraction summary

Include:
- zipfile and shutil usage
- Progress reporting
- Error handling for corrupt archives
- Directory structure creation

NO markdown, ONLY Python code.`

        systemPrompt = `You create Python scripts for file extraction and organization. Output ONLY Python code.`
        break

      case 'nextjs-to-python':
        const repoContext = gitUrl ? `Git repository: ${gitUrl}` : ''
        const filesContext = files && files.length > 0 ? `Files: ${files.join(', ')}` : ''
        
        prompt = `Convert a Next.js application to Python Flask/Django.

${repoContext}
${filesContext}
${input ? `Code:\n${input}` : ''}

RULES:
1. Output a complete Python web application
2. Convert React components to Jinja2 templates
3. Convert Next.js API routes to Flask/Django views
4. Convert getServerSideProps/getStaticProps to backend logic
5. Handle routing with Flask routes
6. Include models, views, and templates structure
7. Add: # pip install flask sqlalchemy

Generate a complete, working Python web application.
NO markdown, ONLY Python code.`

        systemPrompt = `You convert Next.js applications to Flask/Django. Output ONLY Python code.`
        break

      default:
        return NextResponse.json({ error: 'Unknown conversion type' }, { status: 400 })
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4000
    })

    let output = completion.choices[0]?.message?.content || ''

    // Remove markdown code blocks
    output = output
      .replace(/^```(?:python|html|javascript|css)?\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim()

    return NextResponse.json({ output })
  } catch (error: any) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: error.message || 'Conversion failed' },
      { status: 500 }
    )
  }
}

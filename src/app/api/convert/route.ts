import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { html, css, js } = body

    if (!html && !css && !js) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const codeParts: string[] = []
    if (html) codeParts.push(`HTML:\n\`\`\`html\n${html}\n\`\`\``)
    if (css) codeParts.push(`CSS:\n\`\`\`css\n${css}\n\`\`\``)
    if (js) codeParts.push(`JavaScript:\n\`\`\`javascript\n${js}\n\`\`\``)

    const prompt = `Convert this web code to a SINGLE runnable Python GUI application using PyQt5.

${codeParts.join('\n\n')}

STRICT RULES:
1. Output ONE complete, executable Python script - no multiple approaches
2. Use PyQt5 for the GUI (professional look, CSS-like styling support)
3. Translate HTML elements to PyQt5 widgets:
   - <div>, <section> → QFrame/QWidget
   - <h1>-<h6>, <p>, <span> → QLabel
   - <button> → QPushButton with clicked.connect()
   - <input>, <textarea> → QLineEdit/QTextEdit
   - <form> → QWidget with layout
   - <ul>/<ol> → QListWidget
   - <li> → QListWidgetItem
4. Convert CSS to setStyleSheet() calls on widgets
5. Convert JavaScript to Python methods connected via signals/slots

LOCAL STORAGE REQUIREMENTS:
6. Create a data storage system at: Programs/Data/Data.txt
7. On first run, ask user to set a password (save hashed password to Data.txt)
8. On subsequent runs, require password to unlock the app
9. Store all app data in Data.txt (JSON format)
10. Use appdata path: os.path.join(os.getenv('APPDATA'), 'Programs', 'Data', 'Data.txt')
11. Create the directory if it doesn't exist

EXE BUILD INSTRUCTIONS (add as comment at top):
12. Add this comment at the very top of the file:
    # Build command: pyinstaller --noconsole --onefile --windowed script.py

OUTPUT FORMAT:
- NO markdown code blocks
- NO explanations before or after
- ONLY valid Python code
- Include all necessary imports
- Include main block that launches the app

Generate the Python code now:`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a Python expert that converts HTML/CSS/JS to working Python GUI applications using PyQt5.

ELEMENT MAPPING:
- <div>, <section> → QFrame or QWidget with layout
- <h1>-<h6>, <p>, <span> → QLabel with text
- <button> → QPushButton with .clicked.connect(handler)
- <input type="text"> → QLineEdit
- <textarea> → QTextEdit
- <ul>/<ol> → QListWidget
- <form> → QWidget with QFormLayout or QVBoxLayout
- <img> → QLabel with QPixmap
- <a> → QPushButton or QLabel with link

STYLING:
- Use widget.setStyleSheet("css-here") for styling
- Support colors, fonts, padding, margins, borders, backgrounds

DATA STORAGE:
- Use JSON for storing data in text files
- Hash passwords with hashlib before storing
- Use os.getenv('APPDATA') for Windows app data folder

Output ONLY valid Python code, nothing else. Make it professional and complete.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2
    })

    let pythonCode = completion.choices[0]?.message?.content || ''

    // Remove markdown code blocks if present
    pythonCode = pythonCode
      .replace(/^```python\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim()

    return NextResponse.json({ python: pythonCode })
  } catch (error: any) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: error.message || 'Conversion failed' },
      { status: 500 }
    )
  }
}

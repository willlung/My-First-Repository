from flask import Flask, request, send_file, render_template
import openai
import pandas as pd
import os
from PyPDF2 import PdfReader

app = Flask(__name__)

# Set your OpenAI API key
openai.api_key = 'YOUR_OPENAI_API_KEY'

@app.route('/')
def upload_form():
    return render_template('upload.html')

@app.route('/', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file uploaded', 400

    file = request.files['file']
    if file.filename == '':
        return 'No file selected', 400

    # Read file content
    if file.filename.endswith('.pdf'):
        reader = PdfReader(file)
        file_content = ''
        for page in reader.pages:
            file_content += page.extract_text()
    else:
        file_content = file.read().decode('utf-8')

    # Process with OpenAI
    response = openai.ChatCompletion.create(
        model='gpt-4',
        messages=[
            {'role': 'user', 'content': f"Extract data from the following text:\n{file_content}"}
        ]
    )
    
    extracted_data = response['choices'][0]['message']['content']

    # Save extracted data to an Excel file
    df = pd.DataFrame({'Extracted Data': [extracted_data]})
    output_file = 'extracted_data.xlsx'
    df.to_excel(output_file, index=False)

    return send_file(output_file, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)

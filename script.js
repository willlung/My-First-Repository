document.getElementById('receipt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('receipt').files[0];
    const output = document.getElementById('output');

    if (file) {
        const reader = new FileReader();
        reader.onload = async function(event) {
            const { createWorker } = require('tesseract.js');
            const worker = createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(event.target.result);
            await worker.terminate();
            output.innerText = text;
        };
        reader.readAsDataURL(file);
    }
});

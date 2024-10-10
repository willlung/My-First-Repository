document.getElementById('receipt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('receipt').files[0];
    const output = document.getElementById('output');

    if (file) {
        const reader = new FileReader();
        reader.onload = async function(event) {
            const { createWorker } = Tesseract;
            const worker = createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(event.target.result);
            await worker.terminate();

            // Extract data (basic example)
            const lines = text.split('\n');
            const receiptData = lines.map(line => {
                const [date, amount, vendor] = line.split(','); // Adjust based on your receipt format
                return { Date: date.trim(), Amount: amount.trim(), Vendor: vendor.trim() };
            });

            output.innerText = JSON.stringify(receiptData, null, 2);
            generateExcel(receiptData);
        };
        reader.readAsDataURL(file);
    }
});

function generateExcel(data) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Receipts');
    XLSX.writeFile(wb, 'Receipts.xlsx');
}

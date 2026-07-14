const XLSX = require("xlsx");

function importProducts(file) {
    const workbook = XLSX.readFile(file);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet);

    return data;
}

module.exports = {
    importProducts
};

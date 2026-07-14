const config = require("./config/config");
const { readJSON } = require("./utils/helper");

(async () => {
    const data = await readJSON(config.database.products);
    console.log("Jumlah:", data.length);
    console.log(data[0]);
})();

const product = require("./services/productService");

(async () => {
    const kategori = await product.getCategories();
    console.log("Jumlah kategori:", kategori.length);
    console.log(kategori);
})();

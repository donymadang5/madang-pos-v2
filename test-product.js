const product = require("./services/productService");

(async () => {

    console.log(await product.getProducts());

})();

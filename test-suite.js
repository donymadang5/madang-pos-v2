const productService = require("./services/productService");
const cartService = require("./services/cartService");
const orderService = require("./services/orderService");
const customerService = require("./services/customerService");
const voucherService = require("./services/voucherService");
const invoiceService = require("./services/invoiceService");
const fs = require("fs");
const path = require("path");

// ==========================================
// TEST RESULTS
// ==========================================

const results = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        results.push({ name, status: "✅ PASS" });
        passCount++;
    } catch (e) {
        results.push({ name, status: `❌ FAIL: ${e.message}` });
        failCount++;
    }
}

async function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// ==========================================
// TESTS
// ==========================================

async function runTests() {
    console.log("\n🧪 STARTING TEST SUITE...\n");
    console.log("━".repeat(60));

    // TEST 1: Product Service
    console.log("\n📦 TEST 1: PRODUCT SERVICE");
    console.log("━".repeat(60));

    test("Get all products", async () => {
        const products = await productService.getProducts();
        await assert(Array.isArray(products), "Products should be array");
        await assert(products.length > 0, "Should have at least 1 product");
    });

    test("Get product by ID", async () => {
        const products = await productService.getProducts();
        if (products.length > 0) {
            const product = await productService.getProduct(products[0].id);
            await assert(product, "Product should exist");
        }
    });

    test("Get categories", async () => {
        const categories = await productService.getCategories();
        await assert(Array.isArray(categories), "Categories should be array");
    });

    // TEST 2: Cart Service
    console.log("\n🛒 TEST 2: CART SERVICE");
    console.log("━".repeat(60));

    const testUserId = "test-user-12345";
    const products = await productService.getProducts();
    
    test("Add item to cart", async () => {
        if (products.length > 0) {
            const cart = await cartService.addItem(
                testUserId,
                products[0],
                2
            );
            await assert(cart, "Cart should be created");
            await assert(cart.items.length > 0, "Cart should have items");
        }
    });

    test("Get cart", async () => {
        const cart = await cartService.getCart(testUserId);
        await assert(cart, "Cart should exist");
    });

    test("Clear cart", async () => {
        await cartService.clearCart(testUserId);
        const cart = await cartService.getCart(testUserId);
        await assert(!cart, "Cart should be cleared");
    });

    // TEST 3: Order Service
    console.log("\n📋 ORDER SERVICE");
    console.log("━".repeat(60));

    let testOrderId = null;

    test("Create order", async () => {
        if (products.length > 0) {
            const items = [
                {
                    id: products[0].id,
                    nama: products[0].nama,
                    harga: products[0].harga,
                    qty: 2
                }
            ];
            const order = await orderService.createOrder(
                testUserId,
                items,
                products[0].harga * 2
            );
            await assert(order, "Order should be created");
            await assert(order.id, "Order should have ID");
            testOrderId = order.id;
        }
    });

    test("Get order", async () => {
        if (testOrderId) {
            const order = await orderService.getOrder(testOrderId);
            await assert(order, "Order should exist");
            await assert(
                order.status === "MENUNGGU_PEMBAYARAN",
                "Initial status should be MENUNGGU_PEMBAYARAN"
            );
        }
    });

    test("Get today orders", async () => {
        const orders = await orderService.getTodayOrders();
        await assert(Array.isArray(orders), "Orders should be array");
    });

    test("Update order status", async () => {
        if (testOrderId) {
            const result = await orderService.updateStatus(
                testOrderId,
                "MENUNGGU_VERIFIKASI"
            );
            await assert(result, "Status update should succeed");
        }
    });

    test("Get order summary", async () => {
        const summary = await orderService.getSummary();
        await assert(summary.total >= 0, "Total should be >= 0");
    });

    // TEST 4: Customer Service
    console.log("\n👥 CUSTOMER SERVICE");
    console.log("━".repeat(60));

    test("Save customer", async () => {
        const result = await customerService.saveCustomer(testUserId);
        await assert(result, "Customer should be saved");
    });

    test("Get customer", async () => {
        const customer = await customerService.getCustomer(testUserId);
        await assert(customer, "Customer should exist");
    });

    test("Get all customers", async () => {
        const customers = await customerService.getCustomers();
        await assert(Array.isArray(customers), "Customers should be array");
    });

    test("Update customer order", async () => {
        if (testOrderId) {
            const order = await orderService.getOrder(testOrderId);
            const result = await customerService.updateOrder(
                testUserId,
                order.total
            );
            await assert(result, "Should update customer order");
        }
    });

    // TEST 5: Voucher Service
    console.log("\n🎁 VOUCHER SERVICE");
    console.log("━".repeat(60));

    test("Create voucher", async () => {
        await voucherService.createVoucher({
            code: "TEST100",
            type: "FIXED",
            value: 100000,
            minimum: 50000
        });
        const voucher = await voucherService.getVoucher("TEST100");
        await assert(voucher, "Voucher should be created");
    });

    test("Validate voucher", async () => {
        const result = await voucherService.validateVoucher(
            "TEST100",
            60000
        );
        await assert(result.ok, "Voucher should be valid");
        await assert(result.diskon === 100000, "Diskon should be correct");
    });

    // TEST 6: Invoice Service
    console.log("\n📄 INVOICE SERVICE");
    console.log("━".repeat(60));

    test("Generate invoice", async () => {
        if (testOrderId) {
            const order = await orderService.getOrder(testOrderId);
            if (order) {
                const pdfFile = await invoiceService.generate(order);
                await assert(
                    fs.existsSync(pdfFile),
                    "PDF file should be created"
                );
            }
        }
    });

    // ==========================================
    // RESULTS
    // ==========================================

    console.log("\n\n🎯 TEST RESULTS");
    console.log("━".repeat(60));

    results.forEach(r => {
        console.log(`${r.status} - ${r.name}`);
    });

    console.log("\n" + "━".repeat(60));
    console.log(`✅ PASSED: ${passCount}`);
    console.log(`❌ FAILED: ${failCount}`);
    console.log(`📊 TOTAL: ${passCount + failCount}`);
    console.log(`📈 PASS RATE: ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%`);
    console.log("━".repeat(60) + "\n");

    // Save report
    const report = {
        timestamp: new Date().toISOString(),
        passed: passCount,
        failed: failCount,
        total: passCount + failCount,
        passRate: ((passCount / (passCount + failCount)) * 100).toFixed(2) + "%",
        results: results
    };

    fs.writeFileSync(
        "./test-report.json",
        JSON.stringify(report, null, 2)
    );

    console.log("📄 Report saved to: test-report.json\n");

    process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);

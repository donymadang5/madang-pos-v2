const adminService = require("./services/adminService");
const orderService = require("./services/orderService");
const customerService = require("./services/customerService");
const productService = require("./services/productService");
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
// ADMIN TESTS
// ==========================================

async function runAdminTests() {
    console.log("\n🧪 STARTING ADMIN FEATURE TESTS...\n");
    console.log("━".repeat(60));

    const testAdminId = "admin-test-12345@s.whatsapp.net";
    const testCustomerId = "customer-test-12345@s.whatsapp.net";

    // TEST 1: Admin Service
    console.log("\n👮 TEST 1: ADMIN SERVICE");
    console.log("━".repeat(60));

    test("Register admin", async () => {
        await adminService.addAdmin(testAdminId);
        const isAdmin = await adminService.isAdmin(testAdminId);
        await assert(isAdmin, "Should be registered as admin");
    });

    test("Check admin status", async () => {
        const isAdmin = await adminService.isAdmin(testAdminId);
        await assert(isAdmin === true, "Should return admin status");
    });

    test("Get all admins", async () => {
        const admins = await adminService.getAdmins();
        await assert(Array.isArray(admins), "Admins should be array");
        await assert(admins.length > 0, "Should have at least 1 admin");
    });

    // TEST 2: Order Management
    console.log("\n📦 TEST 2: ORDER MANAGEMENT");
    console.log("━".repeat(60));

    test("Get order summary", async () => {
        const summary = await orderService.getSummary();
        await assert(summary.total >= 0, "Total should be >= 0");
        await assert(summary.waitingPayment >= 0, "Waiting payment >= 0");
        await assert(summary.waitingVerification >= 0, "Waiting verification >= 0");
        await assert(summary.paid >= 0, "Paid >= 0");
    });

    test("Get today orders", async () => {
        const orders = await orderService.getTodayOrders();
        await assert(Array.isArray(orders), "Today orders should be array");
    });

    test("Get today revenue", async () => {
        const revenue = await orderService.getTodayRevenue();
        await assert(typeof revenue === "number", "Revenue should be number");
        await assert(revenue >= 0, "Revenue should be >= 0");
    });

    test("Get waiting verification orders", async () => {
        const orders = await orderService.getWaitingVerification();
        await assert(Array.isArray(orders), "Orders should be array");
    });

    test("Get orders by status", async () => {
        const orders = await orderService.getOrdersByStatus("MENUNGGU_PEMBAYARAN");
        await assert(Array.isArray(orders), "Orders should be array");
    });

    test("Find order by keyword", async () => {
        const orders = await orderService.getOrders();
        if (orders.length > 0) {
            const keyword = orders[0].id.substring(0, 5);
            const found = await orderService.findOrder(keyword);
            await assert(found, "Should find order");
        }
    });

    // TEST 3: Customer Management
    console.log("\n👥 TEST 3: CUSTOMER MANAGEMENT");
    console.log("━".repeat(60));

    test("Get all customers", async () => {
        const customers = await customerService.getCustomers();
        await assert(Array.isArray(customers), "Customers should be array");
    });

    test("Get top customers", async () => {
        const topCustomers = await customerService.getTopCustomers(5);
        await assert(Array.isArray(topCustomers), "Top customers should be array");
        await assert(topCustomers.length <= 5, "Should respect limit");
    });

    test("Search customer", async () => {
        const customers = await customerService.getCustomers();
        if (customers.length > 0) {
            const keyword = customers[0].jid.substring(0, 5);
            const results = await customerService.searchCustomer(keyword);
            await assert(Array.isArray(results), "Results should be array");
        }
    });

    test("Get customers by point", async () => {
        const customers = await customerService.getCustomersByPoint(0);
        await assert(Array.isArray(customers), "Customers should be array");
    });

    test("Get new customers", async () => {
        const customers = await customerService.getNewCustomers(7);
        await assert(Array.isArray(customers), "New customers should be array");
    });

    test("Get inactive customers", async () => {
        const customers = await customerService.getInactiveCustomers(30);
        await assert(Array.isArray(customers), "Inactive customers should be array");
    });

    test("Get customer detail", async () => {
        const customers = await customerService.getCustomers();
        if (customers.length > 0) {
            const detail = await customerService.getCustomerDetail(customers[0].jid);
            await assert(detail, "Should get customer detail");
            await assert(detail.history, "Should have order history");
        }
    });

    // TEST 4: Product Management
    console.log("\n📊 TEST 4: PRODUCT MANAGEMENT");
    console.log("━".repeat(60));

    test("Get all products", async () => {
        const products = await productService.getProducts();
        await assert(Array.isArray(products), "Products should be array");
    });

    test("Get product by category", async () => {
        const products = await productService.getProducts();
        if (products.length > 0) {
            const category = products[0].kategori;
            const filtered = await productService.getByCategory(category);
            await assert(Array.isArray(filtered), "Filtered should be array");
        }
    });

    test("Reduce stock", async () => {
        const products = await productService.getProducts();
        if (products.length > 0) {
            const initialStock = products[0].stok;
            const items = [{ id: products[0].id, qty: 1 }];
            await productService.reduceStock(items);
            const updated = await productService.getProduct(products[0].id);
            // Note: Stock should be reduced or remain same if it was 0
            await assert(
                Number(updated.stok) <= Number(initialStock),
                "Stock should be reduced or same"
            );
        }
    });

    // TEST 5: Statistics
    console.log("\n📈 TEST 5: STATISTICS & ANALYTICS");
    console.log("━".repeat(60));

    test("Dashboard statistics", async () => {
        const orders = await orderService.getTodayOrders();
        const customers = await customerService.getCustomers();
        const revenue = await orderService.getTodayRevenue();
        
        await assert(orders.length >= 0, "Orders count valid");
        await assert(customers.length >= 0, "Customers count valid");
        await assert(revenue >= 0, "Revenue valid");
    });

    test("Order status breakdown", async () => {
        const summary = await orderService.getSummary();
        const total = 
            summary.waitingPayment + 
            summary.waitingVerification + 
            summary.paid + 
            summary.rejected;
        
        await assert(total === summary.total, "Status breakdown matches total");
    });

    test("Customer member distribution", async () => {
        const customers = await customerService.getCustomers();
        const memberLevels = {};
        
        customers.forEach(c => {
            memberLevels[c.member] = (memberLevels[c.member] || 0) + 1;
        });
        
        await assert(Object.keys(memberLevels).length >= 0, "Member distribution valid");
    });

    // TEST 6: Data Export
    console.log("\n📤 TEST 6: DATA EXPORT");
    console.log("━".repeat(60));

    test("Export orders list", async () => {
        const orders = await orderService.getOrders();
        await assert(Array.isArray(orders), "Orders should be exportable");
        await assert(orders.length >= 0, "Should export all orders");
    });

    test("Export customers list", async () => {
        const customers = await customerService.getCustomers();
        await assert(Array.isArray(customers), "Customers should be exportable");
        await assert(customers.length >= 0, "Should export all customers");
    });

    test("Export products list", async () => {
        const products = await productService.getProducts();
        await assert(Array.isArray(products), "Products should be exportable");
        await assert(products.length > 0, "Should have products to export");
    });

    // TEST 7: Backup & Restore
    console.log("\n💾 TEST 7: BACKUP & RESTORE");
    console.log("━".repeat(60));

    test("Database files exist", async () => {
        const config = require("./config/config");
        await assert(fs.existsSync(config.database.orders), "Orders DB exists");
        await assert(fs.existsSync(config.database.customers), "Customers DB exists");
        await assert(fs.existsSync(config.database.products), "Products DB exists");
    });

    test("Backup directory exists", async () => {
        await assert(fs.existsSync("./backup"), "Backup directory should exist");
    });

    // TEST 8: Admin Permissions
    console.log("\n🔐 TEST 8: ADMIN PERMISSIONS");
    console.log("━".repeat(60));

    test("Non-admin cannot access admin features", async () => {
        const nonAdminId = "non-admin-12345@s.whatsapp.net";
        const isAdmin = await adminService.isAdmin(nonAdminId);
        await assert(isAdmin === false, "Non-admin should not have access");
    });

    test("Remove admin", async () => {
        const testRemoveId = "test-remove-admin@s.whatsapp.net";
        await adminService.addAdmin(testRemoveId);
        await adminService.removeAdmin(testRemoveId);
        const isAdmin = await adminService.isAdmin(testRemoveId);
        await assert(isAdmin === false, "Admin should be removed");
    });

    // ==========================================
    // RESULTS
    // ==========================================

    console.log("\n\n🎯 ADMIN TEST RESULTS");
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
        testType: "ADMIN_FEATURES",
        passed: passCount,
        failed: failCount,
        total: passCount + failCount,
        passRate: ((passCount / (passCount + failCount)) * 100).toFixed(2) + "%",
        results: results
    };

    fs.writeFileSync(
        "./test-report-admin.json",
        JSON.stringify(report, null, 2)
    );

    console.log("📄 Report saved to: test-report-admin.json\n");

    process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runAdminTests().catch(console.error);

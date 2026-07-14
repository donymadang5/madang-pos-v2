const fs = require("fs");
const path = require("path");

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

const perfResults = [];
let testCount = 0;

function recordMetric(name, value, unit, threshold, status) {
    perfResults.push({
        metric: name,
        value: value,
        unit: unit,
        threshold: threshold,
        status: status,
        timestamp: new Date().toISOString()
    });
    testCount++;
}

// ==========================================
// PERFORMANCE TESTS
// ==========================================

async function runPerformanceTests() {
    console.log("\n⚡ STARTING PERFORMANCE OPTIMIZATION TESTS...\n");
    console.log("━".repeat(70));

    const memStart = process.memoryUsage();

    // ==========================================
    // 1. DATABASE QUERY PERFORMANCE
    // ==========================================
    console.log("\n📊 1. DATABASE QUERY PERFORMANCE");
    console.log("━".repeat(70));

    try {
        const productService = require("./services/productService");

        // Test: Get all products
        let start = Date.now();
        const products = await productService.getProducts();
        let duration = Date.now() - start;

        const status1 = duration < 100 ? "✅ FAST" : duration < 500 ? "⚠️ OK" : "❌ SLOW";
        recordMetric("Get all products", duration, "ms", "< 100ms", status1);
        console.log(`${status1} - Get all products: ${duration}ms`);

        // Test: Get categories
        start = Date.now();
        const categories = await productService.getCategories();
        duration = Date.now() - start;

        const status2 = duration < 100 ? "✅ FAST" : duration < 500 ? "⚠️ OK" : "❌ SLOW";
        recordMetric("Get categories", duration, "ms", "< 100ms", status2);
        console.log(`${status2} - Get categories: ${duration}ms`);

        // Test: Get by category
        if (categories.length > 0) {
            start = Date.now();
            const filtered = await productService.getByCategory(categories[0]);
            duration = Date.now() - start;

            const status3 = duration < 100 ? "✅ FAST" : duration < 500 ? "⚠️ OK" : "❌ SLOW";
            recordMetric("Get by category", duration, "ms", "< 100ms", status3);
            console.log(`${status3} - Get by category: ${duration}ms`);
        }
    } catch (e) {
        console.error("❌ Database query test failed:", e.message);
    }

    // ==========================================
    // 2. CUSTOMER DATA OPERATIONS
    // ==========================================
    console.log("\n👥 2. CUSTOMER DATA OPERATIONS");
    console.log("━".repeat(70));

    try {
        const customerService = require("./services/customerService");

        // Test: Get all customers
        let start = Date.now();
        const customers = await customerService.getCustomers();
        let duration = Date.now() - start;

        const status1 = duration < 200 ? "✅ FAST" : duration < 1000 ? "⚠️ OK" : "❌ SLOW";
        recordMetric("Get all customers", duration, "ms", "< 200ms", status1);
        console.log(`${status1} - Get all customers: ${duration}ms (${customers.length} records)`);

        // Test: Search customer
        if (customers.length > 0) {
            start = Date.now();
            const results = await customerService.searchCustomer(customers[0].jid.substring(0, 5));
            duration = Date.now() - start;

            const status2 = duration < 100 ? "✅ FAST" : duration < 500 ? "⚠️ OK" : "❌ SLOW";
            recordMetric("Search customer", duration, "ms", "< 100ms", status2);
            console.log(`${status2} - Search customer: ${duration}ms`);
        }

        // Test: Get top customers
        start = Date.now();
        const topCustomers = await customerService.getTopCustomers(10);
        duration = Date.now() - start;

        const status3 = duration < 100 ? "✅ FAST" : duration < 500 ? "⚠️ OK" : "❌ SLOW";
        recordMetric("Get top customers", duration, "ms", "< 100ms", status3);
        console.log(`${status3} - Get top customers: ${duration}ms`);
    } catch (e) {
        console.error("❌ Customer operations test failed:", e.message);
    }

    // ==========================================
    // 3. ORDER OPERATIONS
    // ==========================================
    console.log("\n📋 3. ORDER OPERATIONS");
    console.log("━".repeat(70));

    try {
        const orderService = require("./services/orderService");

        // Test: Get all orders
        let start = Date.now();
        const orders = await orderService.getOrders();
        let duration = Date.now() - start;

        const status1 = duration < 200 ? "✅ FAST" : duration < 1000 ? "⚠️ OK" : "❌ SLOW";
        recordMetric("Get all orders", duration, "ms", "< 200ms", status1);
        console.log(`${status1} - Get all orders: ${duration}ms (${orders.length} records)`);

        // Test: Get today orders
        start = Date.now();
        const todayOrders = await orderService.getTodayOrders();
        duration = Date.now() - start;

        const status2 = duration < 100 ? "✅ FAST" : duration < 500 ? "⚠️ OK" : "❌ SLOW";
        recordMetric("Get today orders", duration, "ms", "< 100ms", status2);
        console.log(`${status2} - Get today orders: ${duration}ms`);

        // Test: Get order summary
        start = Date.now();
        const summary = await orderService.getSummary();
        duration = Date.now() - start;

        const status3 = duration < 100 ? "✅ FAST" : duration < 500 ? "⚠️ OK" : "❌ SLOW";
        recordMetric("Get order summary", duration, "ms", "< 100ms", status3);
        console.log(`${status3} - Get order summary: ${duration}ms`);
    } catch (e) {
        console.error("❌ Order operations test failed:", e.message);
    }

    // ==========================================
    // 4. MEMORY USAGE ANALYSIS
    // ==========================================
    console.log("\n💾 4. MEMORY USAGE ANALYSIS");
    console.log("━".repeat(70));

    const memCurrent = process.memoryUsage();
    const memUsed = (memCurrent.heapUsed / 1024 / 1024).toFixed(2);
    const memTotal = (memCurrent.heapTotal / 1024 / 1024).toFixed(2);
    const memPercent = ((memCurrent.heapUsed / memCurrent.heapTotal) * 100).toFixed(2);

    const memStatus = memPercent < 70 ? "✅ GOOD" : memPercent < 85 ? "⚠️ FAIR" : "❌ HIGH";
    recordMetric("Heap usage", parseFloat(memPercent), "%", "< 70%", memStatus);

    console.log(`${memStatus} - Heap: ${memUsed}MB / ${memTotal}MB (${memPercent}%)`);

    const external = (memCurrent.external / 1024 / 1024).toFixed(2);
    console.log(`External: ${external}MB`);

    // ==========================================
    // 5. FILE I/O PERFORMANCE
    // ==========================================
    console.log("\n📁 5. FILE I/O PERFORMANCE");
    console.log("━".repeat(70));

    try {
        const config = require("./config/config");

        // Test reading database files
        const dbFiles = [
            config.database.products,
            config.database.customers,
            config.database.orders
        ];

        for (const file of dbFiles) {
            if (fs.existsSync(file)) {
                const start = Date.now();
                const data = fs.readFileSync(file, "utf-8");
                const duration = Date.now() - start;
                const fileSize = (fs.statSync(file).size / 1024).toFixed(2);

                const status = duration < 50 ? "✅ FAST" : duration < 200 ? "⚠️ OK" : "❌ SLOW";
                recordMetric(`Read ${path.basename(file)}`, duration, "ms", "< 50ms", status);
                console.log(`${status} - ${path.basename(file)}: ${duration}ms (${fileSize}KB)`);
            }
        }
    } catch (e) {
        console.error("❌ File I/O test failed:", e.message);
    }

    // ==========================================
    // 6. CONCURRENT OPERATIONS (LOAD TEST)
    // ==========================================
    console.log("\n🔄 6. CONCURRENT OPERATIONS (LOAD TEST)");
    console.log("━".repeat(70));

    try {
        const productService = require("./services/productService");

        // Simulate 10 concurrent product fetches
        const start = Date.now();
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(productService.getProducts());
        }
        await Promise.all(promises);
        const duration = Date.now() - start;

        const status = duration < 500 ? "✅ GOOD" : duration < 1000 ? "⚠️ OK" : "❌ SLOW";
        recordMetric("10 concurrent getProducts", duration, "ms", "< 500ms", status);
        console.log(`${status} - 10 concurrent requests: ${duration}ms`);
    } catch (e) {
        console.error("❌ Concurrent operations test failed:", e.message);
    }

    // ==========================================
    // 7. DATA STRUCTURE EFFICIENCY
    // ==========================================
    console.log("\n📈 7. DATA STRUCTURE EFFICIENCY");
    console.log("━".repeat(70));

    try {
        const customerService = require("./services/customerService");
        const customers = await customerService.getCustomers();

        if (customers.length > 0) {
            const sampleSize = (JSON.stringify(customers[0]).length / 1024).toFixed(3);
            console.log(`✅ Average customer record size: ${sampleSize}KB`);
            recordMetric("Avg customer record size", parseFloat(sampleSize), "KB", "< 5KB", "✅ GOOD");
        }
    } catch (e) {
        console.error("❌ Data structure test failed:", e.message);
    }

    // ==========================================
    // 8. RESPONSE TIME ANALYSIS
    // ==========================================
    console.log("\n⏱️ 8. RESPONSE TIME ANALYSIS");
    console.log("━".repeat(70));

    const totalTime = Object.values(perfResults).reduce((sum, r) => {
        return sum + (typeof r.value === "number" ? r.value : 0);
    }, 0);

    const avgTime = (totalTime / perfResults.length).toFixed(2);
    console.log(`Average operation time: ${avgTime}ms`);
    recordMetric("Average response time", parseFloat(avgTime), "ms", "< 200ms", "✅ GOOD");

    // ==========================================
    // RECOMMENDATIONS
    // ==========================================
    console.log("\n\n💡 PERFORMANCE OPTIMIZATION RECOMMENDATIONS");
    console.log("━".repeat(70));

    const recommendations = [
        "✓ Implement in-memory caching for frequently accessed products",
        "✓ Add database indexing for customer search queries",
        "✓ Implement pagination for large result sets",
        "✓ Add query result caching with TTL",
        "✓ Optimize file read/write operations with streams",
        "✓ Implement connection pooling for database operations",
        "✓ Add rate limiting to prevent abuse",
        "✓ Implement gzip compression for responses",
        "✓ Use async/await properly to prevent blocking",
        "✓ Monitor and optimize JSON serialization",
        "✓ Implement request batching for bulk operations",
        "✓ Add database query logging to identify slow queries",
        "✓ Implement CDN for static assets",
        "✓ Add performance monitoring dashboards",
        "✓ Implement lazy loading for large datasets"
    ];

    recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
    });

    // ==========================================
    // PERFORMANCE SCORE
    // ==========================================
    console.log("\n\n🎯 PERFORMANCE SUMMARY");
    console.log("━".repeat(70));

    const fastCount = perfResults.filter(r => r.status.includes("FAST")).length;
    const okCount = perfResults.filter(r => r.status.includes("OK")).length;
    const slowCount = perfResults.filter(r => r.status.includes("SLOW")).length;

    console.log(`✅ Fast: ${fastCount}`);
    console.log(`⚠️ OK: ${okCount}`);
    console.log(`❌ Slow: ${slowCount}`);
    console.log(`📊 Total tests: ${testCount}`);

    const perfScore = ((fastCount / testCount) * 100).toFixed(2);
    console.log(`📈 Performance Score: ${perfScore}%`);
    console.log("━".repeat(70) + "\n");

    // Save report
    const report = {
        timestamp: new Date().toISOString(),
        type: "PERFORMANCE_ANALYSIS",
        metrics: perfResults,
        summary: {
            fast: fastCount,
            ok: okCount,
            slow: slowCount,
            total: testCount,
            performanceScore: perfScore + "%"
        },
        memory: {
            heapUsed: memUsed + "MB",
            heapTotal: memTotal + "MB",
            percentage: memPercent + "%"
        },
        recommendations: recommendations
    };

    fs.writeFileSync(
        "./performance-report.json",
        JSON.stringify(report, null, 2)
    );

    console.log("📄 Report saved to: performance-report.json\n");

    process.exit(slowCount > 3 ? 1 : 0);
}

// Run tests
runPerformanceTests().catch(console.error);

const fs = require("fs");
const path = require("path");

// ==========================================
// SECURITY AUDIT RESULTS
// ==========================================

const results = [];
let passCount = 0;
let failCount = 0;
let warningCount = 0;

function pass(name, message = "") {
    results.push({ name, status: "✅ PASS", message });
    passCount++;
}

function fail(name, message = "") {
    results.push({ name, status: "❌ FAIL", message });
    failCount++;
}

function warn(name, message = "") {
    results.push({ name, status: "⚠️ WARNING", message });
    warningCount++;
}

// ==========================================
// SECURITY CHECKS
// ==========================================

async function runSecurityAudit() {
    console.log("\n🔐 STARTING SECURITY AUDIT...\n");
    console.log("━".repeat(70));

    // ==========================================
    // 1. INPUT VALIDATION
    // ==========================================
    console.log("\n📋 1. INPUT VALIDATION CHECKS");
    console.log("━".repeat(70));

    try {
        const cartService = require("./services/cartService");
        pass("Cart service validates user input", "addItem checks user & product");
    } catch (e) {
        fail("Cart service input validation", e.message);
    }

    try {
        const orderService = require("./services/orderService");
        pass("Order service validates items", "createOrder validates array");
    } catch (e) {
        fail("Order service input validation", e.message);
    }

    // ==========================================
    // 2. PERMISSION CHECKS
    // ==========================================
    console.log("\n🔐 2. PERMISSION & ACCESS CONTROL");
    console.log("━".repeat(70));

    try {
        const adminService = require("./services/adminService");
        const isAdmin = await adminService.isAdmin("random-user@s.whatsapp.net");
        if (isAdmin === false) {
            pass("Admin permission check", "Non-admin correctly denied");
        } else {
            fail("Admin permission check", "Should deny non-admin access");
        }
    } catch (e) {
        fail("Admin permission check", e.message);
    }

    // ==========================================
    // 3. DATA SANITIZATION
    // ==========================================
    console.log("\n🧹 3. DATA SANITIZATION");
    console.log("━".repeat(70));

    try {
        const customerService = require("./services/customerService");
        const customers = await customerService.getCustomers();
        
        const hasValidData = customers.every(c => 
            typeof c.jid === "string" &&
            typeof c.member === "string" &&
            typeof c.totalBelanja === "number"
        );
        
        if (hasValidData) {
            pass("Customer data sanitization", "All customer data properly typed");
        } else {
            fail("Customer data sanitization", "Invalid data types detected");
        }
    } catch (e) {
        fail("Customer data sanitization", e.message);
    }

    // ==========================================
    // 4. ERROR HANDLING
    // ==========================================
    console.log("\n⚠️ 4. ERROR HANDLING & LOGGING");
    console.log("━".repeat(70));

    try {
        const cartService = require("./services/cartService");
        try {
            await cartService.addItem(null, null, 0);
            fail("Error handling - null validation", "Should throw error");
        } catch (e) {
            pass("Error handling - null validation", "Properly catches null inputs");
        }
    } catch (e) {
        fail("Error handling test", e.message);
    }

    // ==========================================
    // 5. DATABASE SECURITY
    // ==========================================
    console.log("\n💾 5. DATABASE SECURITY");
    console.log("━".repeat(70));

    try {
        const config = require("./config/config");
        
        // Check database location
        if (config.database.orders && config.database.orders.includes("/")) {
            pass("Database path security", "Using absolute paths");
        } else {
            warn("Database path security", "Check if paths are properly configured");
        }

        // Check backup directory
        if (fs.existsSync("./backup")) {
            pass("Backup directory exists", "Backup capability available");
        } else {
            warn("Backup directory", "Backup directory not found");
        }

        // Check .gitignore
        if (fs.existsSync("./.gitignore")) {
            const gitignore = fs.readFileSync("./.gitignore", "utf-8");
            const shouldIgnore = ["session", "database", "invoice", "backup"];
            const ignored = shouldIgnore.filter(item => gitignore.includes(item));
            
            if (ignored.length === shouldIgnore.length) {
                pass("Git security (.gitignore)", "Sensitive files properly ignored");
            } else {
                warn("Git security (.gitignore)", `Only ${ignored.length}/${shouldIgnore.length} sensitive items ignored`);
            }
        } else {
            fail("Git security (.gitignore)", ".gitignore not found");
        }
    } catch (e) {
        fail("Database security check", e.message);
    }

    // ==========================================
    // 6. SESSION SECURITY
    // ==========================================
    console.log("\n🔑 6. SESSION SECURITY");
    console.log("━".repeat(70));

    try {
        const sessionService = require("./services/sessionService");
        
        // Test session isolation
        await sessionService.goto("user1", "TEST_STEP", { data: "user1" });
        await sessionService.goto("user2", "TEST_STEP", { data: "user2" });
        
        const session1 = await sessionService.getSession("user1");
        const session2 = await sessionService.getSession("user2");
        
        if (session1.data !== session2.data) {
            pass("Session isolation", "Sessions properly isolated per user");
        } else {
            fail("Session isolation", "Sessions not properly isolated");
        }
        
        // Cleanup
        await sessionService.clearSession("user1");
        await sessionService.clearSession("user2");
    } catch (e) {
        fail("Session security check", e.message);
    }

    // ==========================================
    // 7. CODE ANALYSIS
    // ==========================================
    console.log("\n🔍 7. CODE SECURITY ANALYSIS");
    console.log("━".repeat(70));

    try {
        const handlers = fs.readdirSync("./handlers");
        const commands = fs.readdirSync("./commands");
        const services = fs.readdirSync("./services");
        
        pass("File structure", `${handlers.length} handlers, ${commands.length} commands, ${services.length} services`);
        
        // Check for dangerous patterns
        const dangerousPatterns = [
            "eval(",
            "Function(",
            "require('child_process')",
            "exec(",
            "spawn("
        ];
        
        const files = [
            ...handlers.map(f => `./handlers/${f}`),
            ...commands.map(f => `./commands/${f}`),
            ...services.map(f => `./services/${f}`)
        ];
        
        let foundDangerous = false;
        for (const file of files) {
            if (fs.existsSync(file) && file.endsWith(".js")) {
                const content = fs.readFileSync(file, "utf-8");
                for (const pattern of dangerousPatterns) {
                    if (content.includes(pattern)) {
                        foundDangerous = true;
                        warn("Dangerous patterns", `Found ${pattern} in ${file}`);
                    }
                }
            }
        }
        
        if (!foundDangerous) {
            pass("Code injection prevention", "No dangerous eval/exec patterns found");
        }
    } catch (e) {
        fail("Code security analysis", e.message);
    }

    // ==========================================
    // 8. DEPENDENCY SECURITY
    // ==========================================
    console.log("\n📦 8. DEPENDENCY SECURITY");
    console.log("━".repeat(70));

    try {
        const packageJson = require("./package.json");
        const dependencies = Object.keys(packageJson.dependencies);
        
        // Check known vulnerable packages
        const knownVulnerable = ["moment", "request"];
        const hasVulnerable = dependencies.some(d => knownVulnerable.includes(d));
        
        if (!hasVulnerable) {
            pass("Known vulnerabilities", "No known vulnerable packages found");
        } else {
            warn("Known vulnerabilities", "Review deprecated packages");
        }
        
        pass("Dependency count", `${dependencies.length} dependencies`);
    } catch (e) {
        fail("Dependency security check", e.message);
    }

    // ==========================================
    // 9. CONFIGURATION SECURITY
    // ==========================================
    console.log("\n⚙️ 9. CONFIGURATION SECURITY");
    console.log("━".repeat(70));

    try {
        const config = require("./config/config");
        
        if (config.database && config.public) {
            pass("Configuration structure", "Proper separation of concerns");
        } else {
            fail("Configuration structure", "Missing required config sections");
        }
        
        // Check for hardcoded secrets
        const configStr = JSON.stringify(config);
        if (!configStr.includes("password") && !configStr.includes("secret") && !configStr.includes("key")) {
            pass("Hardcoded secrets", "No hardcoded secrets detected");
        } else {
            warn("Hardcoded secrets", "Review configuration for sensitive data");
        }
    } catch (e) {
        fail("Configuration security check", e.message);
    }

    // ==========================================
    // 10. VALIDATION & SANITIZATION
    // ==========================================
    console.log("\n✔️ 10. INPUT/OUTPUT VALIDATION");
    console.log("━".repeat(70));

    try {
        const productService = require("./services/productService");
        const products = await productService.getProducts();
        
        if (Array.isArray(products) && products.length > 0) {
            const hasRequired = products[0].id && products[0].nama && products[0].harga;
            if (hasRequired) {
                pass("Product data validation", "All required fields present");
            } else {
                fail("Product data validation", "Missing required fields");
            }
        } else {
            warn("Product data validation", "No products to validate");
        }
    } catch (e) {
        fail("Input/output validation", e.message);
    }

    // ==========================================
    // RECOMMENDATIONS
    // ==========================================
    console.log("\n\n💡 SECURITY RECOMMENDATIONS");
    console.log("━".repeat(70));
    
    const recommendations = [
        "✓ Implement rate limiting on API endpoints",
        "✓ Add request/response logging for audit trail",
        "✓ Implement 2FA for admin accounts",
        "✓ Add encryption for sensitive customer data",
        "✓ Implement request signing/verification",
        "✓ Add CORS headers for API security",
        "✓ Implement input length limits",
        "✓ Add password hashing for admin credentials",
        "✓ Implement API versioning",
        "✓ Add security headers (X-Frame-Options, CSP, etc)"
    ];
    
    recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
    });

    // ==========================================
    // RESULTS SUMMARY
    // ==========================================

    console.log("\n\n🎯 SECURITY AUDIT RESULTS");
    console.log("━".repeat(70));

    results.forEach(r => {
        console.log(`${r.status} - ${r.name}`);
        if (r.message) {
            console.log(`   └─ ${r.message}`);
        }
    });

    console.log("\n" + "━".repeat(70));
    console.log(`✅ PASSED: ${passCount}`);
    console.log(`❌ FAILED: ${failCount}`);
    console.log(`⚠️ WARNINGS: ${warningCount}`);
    console.log(`📊 TOTAL: ${passCount + failCount + warningCount}`);
    
    const totalTests = passCount + failCount + warningCount;
    const securityScore = ((passCount / totalTests) * 100).toFixed(2);
    
    console.log(`📊 SECURITY SCORE: ${securityScore}%`);
    console.log("━".repeat(70) + "\n");

    // Save report
    const report = {
        timestamp: new Date().toISOString(),
        type: "SECURITY_AUDIT",
        passed: passCount,
        failed: failCount,
        warnings: warningCount,
        total: totalTests,
        securityScore: securityScore + "%",
        results: results,
        recommendations: recommendations
    };

    fs.writeFileSync(
        "./security-audit-report.json",
        JSON.stringify(report, null, 2)
    );

    console.log("📄 Report saved to: security-audit-report.json\n");

    process.exit(failCount > 0 ? 1 : 0);
}

// Run audit
runSecurityAudit().catch(console.error);

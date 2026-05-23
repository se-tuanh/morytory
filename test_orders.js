const assert = require('assert');

async function runTests() {
  const baseUrl = "http://127.0.0.1:8787";
  const adminToken = "admin123"; // Mật khẩu admin mặc định
  
  console.log("=== Testing Order Submit (POST /api/orders) ===");
  const testPhone = "0982892784";
  const testOrder = {
    customerName: "Nguyễn Văn Thử Nghiệm",
    customerPhone: testPhone,
    customerAddress: "123 Đường Test, Quận 1, TP. HCM",
    paymentMethod: "BANK",
    theme: "Sinh nhật gia đình",
    quantity: 2,
    unitPrice: 450000,
    totalPrice: 900000,
    swappedFaces: {
      father: "https://litter.catbox.moe/mboq7l.jpg",
      mother: "https://litter.catbox.moe/d182vt.jpg"
    },
    compositePreview: "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
  };

  const submitRes = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(testOrder)
  });

  assert.strictEqual(submitRes.status, 200, "Submit should return 200");
  const submitData = await submitRes.json();
  assert.strictEqual(submitData.success, true, "Submit should be successful");
  assert.ok(submitData.order.id.startsWith("ORD-"), "Should generate Order ID starting with ORD-");
  assert.strictEqual(submitData.order.status, "Pending", "New order should default to Pending status");
  console.log("✓ Order submitted successfully! Order ID:", submitData.order.id, "Status:", submitData.order.status);

  console.log("\n=== Testing Unauthorized Admin Access (GET /api/admin/orders) ===");
  const badGetRes = await fetch(`${baseUrl}/api/admin/orders`);
  assert.strictEqual(badGetRes.status, 401, "Admin retrieve without header should return 401");
  console.log("✓ Correctly blocked unauthorized admin access!");

  console.log("\n=== Testing Authorized Admin Access (GET /api/admin/orders) ===");
  const getRes = await fetch(`${baseUrl}/api/admin/orders`, {
    headers: {
      "Authorization": `Bearer ${adminToken}`
    }
  });
  assert.strictEqual(getRes.status, 200, "Retrieve with authorization header should return 200");
  
  const getData = await getRes.json();
  assert.strictEqual(getData.success, true, "Retrieve should be successful");
  const found = getData.orders.find(o => o.id === submitData.order.id);
  assert.ok(found, "The submitted order should be listed in the admin panel");
  console.log("✓ Authorized admin retrieve successful! Total orders:", getData.orders.length);

  console.log("\n=== Testing Order Status Update (POST /api/admin/orders/update-status) ===");
  const updateRes = await fetch(`${baseUrl}/api/admin/orders/update-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      orderId: submitData.order.id,
      status: "Processing"
    })
  });
  assert.strictEqual(updateRes.status, 200, "Update status should return 200");
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.success, true, "Update status should be successful");
  console.log("✓ Updated order status to 'Processing' successfully!");

  console.log("\n=== Testing Customer Order Lookup (GET /api/orders/lookup) ===");
  // Test missing orderId (should fail with 400)
  const badLookupRes = await fetch(`${baseUrl}/api/orders/lookup?phone=${testPhone}`);
  assert.strictEqual(badLookupRes.status, 400, "Lookup without order ID should fail with 400");
  
  // Test correct lookup
  const lookupRes = await fetch(`${baseUrl}/api/orders/lookup?phone=${testPhone}&orderId=${submitData.order.id}`);
  assert.strictEqual(lookupRes.status, 200, "Lookup should return 200");
  const lookupData = await lookupRes.json();
  assert.strictEqual(lookupData.success, true, "Lookup should be successful");
  assert.ok(Array.isArray(lookupData.orders), "Should return an array of orders");
  
  const matchedOrder = lookupData.orders.find(o => o.id === submitData.order.id);
  assert.ok(matchedOrder, "Customer lookup should find their placed order");
  assert.strictEqual(matchedOrder.status, "Processing", "The matched order should show the updated 'Processing' status");
  console.log("✓ Customer lookup successful! Found customer orders count:", lookupData.orders.length);
  
  console.log("\nAll Backend and Authentication API tests passed successfully!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

import { TEMPLATES, TEMPLATE_URLS } from "./templates_data.js";

const ordersMemory = [];

export default {
  async fetch(request, env, ctx) {
    // Cấu hình CORS để không bị trình duyệt chặn
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Xử lý request OPTIONS (Preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // API lấy ảnh mẫu từ bộ nhớ hoặc link dự phòng
    if (request.method === "GET" && url.pathname.startsWith("/templates/")) {
      const parts = url.pathname.split("/");
      const templateKey = parts[parts.length - 1];
      
      // Serve from memory if available
      const base64Data = TEMPLATES[templateKey];
      if (base64Data) {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Response(bytes.buffer, {
          headers: {
            ...corsHeaders,
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400"
          }
        });
      }

      // Fallback: Proxy external URL if config exists
      const targetUrl = TEMPLATE_URLS[templateKey];
      if (!targetUrl) {
        return new Response("Template not found", { status: 404, headers: corsHeaders });
      }
      try {
        const res = await fetch(targetUrl);
        if (!res.ok) {
          return new Response("Failed to fetch template from source", { status: res.status, headers: corsHeaders });
        }
        return new Response(res.body, {
          headers: {
            ...corsHeaders,
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400"
          }
        });
      } catch (err) {
        return new Response(`Error proxying template: ${err.message}`, { status: 500, headers: corsHeaders });
      }
    }

    // API ghép mặt bằng AI Replicate
    if (request.method === "POST" && url.pathname === "/api/process-image") {
      try {
        const token = env.REPLICATE_API_TOKEN;
        if (!token) {
          return new Response(JSON.stringify({ error: "Thiếu cấu hình REPLICATE_API_TOKEN ở phía server." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const formData = await request.formData();
        const imageFile = formData.get("image");
        const templateKey = formData.get("templateKey");

        if (!imageFile || !(imageFile instanceof File)) {
          return new Response(JSON.stringify({ error: "Không tìm thấy file ảnh tải lên." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        if (!templateKey || (!TEMPLATES[templateKey] && !TEMPLATE_URLS[templateKey])) {
          return new Response(JSON.stringify({ error: "templateKey không hợp lệ hoặc bị thiếu." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Convert upload file to Base64 Data URL for Replicate
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const dataUrl = `data:${imageFile.type};base64,${base64String}`;

        // Determine public URL for template
        let targetTemplateUrl = "";
        const requestUrl = new URL(request.url);
        
        // If local development, use pre-uploaded Litterbox URLs (since Replicate cannot fetch localhost)
        const isLocal = requestUrl.hostname === "127.0.0.1" || requestUrl.hostname === "localhost";
        if (isLocal) {
          targetTemplateUrl = TEMPLATE_URLS[templateKey];
          if (!targetTemplateUrl) {
            return new Response(JSON.stringify({ error: `Không tìm thấy URL Litterbox cho template: ${templateKey}` }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        } else {
          // In production, reference the worker's own public templates endpoint
          targetTemplateUrl = `${requestUrl.origin}/templates/${templateKey}`;
        }

        console.log("Processing Face Swap. Template URL:", targetTemplateUrl);

        // Call Replicate Face Swap API
        const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            version: env.REPLICATE_MODEL_VERSION || "278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
            input: {
              input_image: targetTemplateUrl,
              swap_image: dataUrl
            }
          })
        });

        if (!replicateRes.ok) {
          const errText = await replicateRes.text();
          throw new Error(`Replicate API error: ${errText}`);
        }

        let prediction = await replicateRes.json();
        const predictionId = prediction.id;

        // Polling Replicate to wait for completion
        let status = prediction.status;
        let attempts = 0;
        const maxAttempts = 30; // Max 45 seconds (1.5s * 30)

        while (status !== "succeeded" && status !== "failed" && status !== "canceled" && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (pollRes.ok) {
            prediction = await pollRes.json();
            status = prediction.status;
          }
          attempts++;
        }

        if (status !== "succeeded") {
          throw new Error(`AI không hoàn thành xử lý. Trạng thái hiện tại: ${status}`);
        }

        const replicateOutputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        if (!replicateOutputUrl) {
          throw new Error("Không nhận được ảnh kết quả từ AI.");
        }

        let finalImageUrl = replicateOutputUrl;

        // Store image into Cloudflare R2 (If bucket configured)
        if (env.MY_BUCKET) {
          try {
            const imgFetch = await fetch(replicateOutputUrl);
            if (imgFetch.ok) {
              const imageBlob = await imgFetch.blob();
              const fileName = `morytory_${Date.now()}_${predictionId}.png`;
              
              await env.MY_BUCKET.put(fileName, imageBlob, {
                httpMetadata: { contentType: "image/png" }
              });

              if (env.R2_PUBLIC_URL) {
                const baseUrl = env.R2_PUBLIC_URL.endsWith('/') ? env.R2_PUBLIC_URL.slice(0, -1) : env.R2_PUBLIC_URL;
                finalImageUrl = `${baseUrl}/${fileName}`;
              }
            }
          } catch (r2Err) {
            console.error("Lỗi khi lưu ảnh vào Cloudflare R2:", r2Err);
          }
        }

        return new Response(JSON.stringify({ imageUrl: finalImageUrl, templateKey }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // API đặt đơn hàng mới
    if (request.method === "POST" && url.pathname === "/api/orders") {
      try {
        const orderData = await request.json();
        orderData.id = "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        orderData.createdAt = new Date().toISOString();
        orderData.status = orderData.status || "Pending"; // Trạng thái mặc định: Đang chờ xử lý

        // 1. Save to Memory Fallback
        ordersMemory.push(orderData);
        if (ordersMemory.length > 100) {
          ordersMemory.shift();
        }

        // 2. Save to R2 if configured
        if (env.MY_BUCKET) {
          const fileName = `orders/order_${orderData.id}.json`;
          await env.MY_BUCKET.put(fileName, JSON.stringify(orderData), {
            httpMetadata: { contentType: "application/json" }
          });
          console.log(`Saved order ${orderData.id} to R2 bucket`);
        }

        return new Response(JSON.stringify({ success: true, order: orderData }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // API cho admin lấy danh sách đơn hàng
    if (request.method === "GET" && url.pathname === "/api/admin/orders") {
      try {
        const authHeader = request.headers.get("Authorization");
        const expectedPass = env.ADMIN_PASSWORD || "admin123";
        if (!authHeader || authHeader !== `Bearer ${expectedPass}`) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        let orders = [];

        if (env.MY_BUCKET) {
          try {
            const listResult = await env.MY_BUCKET.list({ prefix: "orders/" });
            for (const obj of listResult.objects) {
              const file = await env.MY_BUCKET.get(obj.key);
              if (file) {
                const data = await file.json();
                orders.push(data);
              }
            }
          } catch (r2Err) {
            console.error("Lỗi khi đọc danh sách đơn hàng từ R2:", r2Err);
          }
        }

        // Merge with memory orders and de-duplicate by ID
        const allOrdersMap = new Map();
        orders.forEach(o => allOrdersMap.set(o.id, o));
        ordersMemory.forEach(o => allOrdersMap.set(o.id, o));

        const mergedOrders = Array.from(allOrdersMap.values());
        mergedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return new Response(JSON.stringify({ success: true, orders: mergedOrders }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // API admin cập nhật trạng thái đơn hàng
    if (request.method === "POST" && url.pathname === "/api/admin/orders/update-status") {
      try {
        const authHeader = request.headers.get("Authorization");
        const expectedPass = env.ADMIN_PASSWORD || "admin123";
        if (!authHeader || authHeader !== `Bearer ${expectedPass}`) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const { orderId, status } = await request.json();
        if (!orderId || !status) {
          return new Response(JSON.stringify({ error: "Thiếu thông tin orderId hoặc status" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // 1. Cập nhật trong bộ nhớ tạm
        const memOrder = ordersMemory.find(o => o.id === orderId);
        if (memOrder) {
          memOrder.status = status;
        }

        // 2. Cập nhật trong R2
        if (env.MY_BUCKET) {
          const fileName = `orders/order_${orderId}.json`;
          const file = await env.MY_BUCKET.get(fileName);
          if (file) {
            const orderData = await file.json();
            orderData.status = status;
            await env.MY_BUCKET.put(fileName, JSON.stringify(orderData), {
              httpMetadata: { contentType: "application/json" }
            });
            console.log(`Updated order ${orderId} status to ${status} in R2`);
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // API tra cứu đơn hàng của khách bằng sđt và mã đơn
    if (request.method === "GET" && url.pathname === "/api/orders/lookup") {
      try {
        const phone = url.searchParams.get("phone");
        const orderId = url.searchParams.get("orderId");
        if (!phone || !orderId) {
          return new Response(JSON.stringify({ error: "Thiếu số điện thoại hoặc mã đơn hàng để tra cứu" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        let orders = [];

        // 1. Lấy từ R2
        if (env.MY_BUCKET) {
          try {
            const listResult = await env.MY_BUCKET.list({ prefix: "orders/" });
            for (const obj of listResult.objects) {
              const file = await env.MY_BUCKET.get(obj.key);
              if (file) {
                const data = await file.json();
                if (data.customerPhone === phone && data.id.toLowerCase().trim() === orderId.toLowerCase().trim()) {
                  orders.push(data);
                }
              }
            }
          } catch (r2Err) {
            console.error("Lỗi khi tìm đơn hàng từ R2:", r2Err);
          }
        }

        // 2. Lấy từ bộ nhớ tạm và trộn lại, loại bỏ trùng lặp
        const matchedMemory = ordersMemory.filter(o => o.customerPhone === phone && o.id.toLowerCase().trim() === orderId.toLowerCase().trim());
        const allOrdersMap = new Map();
        orders.forEach(o => allOrdersMap.set(o.id, o));
        matchedMemory.forEach(o => allOrdersMap.set(o.id, o));

        const mergedOrders = Array.from(allOrdersMap.values());
        mergedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return new Response(JSON.stringify({ success: true, orders: mergedOrders }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Default Router Response
    return new Response("MoryTory API Worker is running. Send POST request to /api/process-image or GET to /templates/:name.", {
      status: 200,
      headers: corsHeaders
    });
  }
};

async function check() {
  const url = 'https://morytory-web.pages.dev/index.html?cb=' + Date.now();
  try {
    console.log(`Fetching live site HTML from: ${url}`);
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const html = await res.text();
    
    // Check if fixed DOMContentLoaded is present
    const isFixed = html.includes("} else if (params.get('lookup') === 'true') {");
    console.log(`Is syntax error fixed on live site? ${isFixed}`);
    
    // Also check product_custom.html
    const customUrl = 'https://morytory-web.pages.dev/product_custom.html?cb=' + Date.now();
    console.log(`Fetching custom page HTML from: ${customUrl}`);
    const resCustom = await fetch(customUrl);
    const htmlCustom = await resCustom.text();
    const isCustomFixed = htmlCustom.includes('const WORKER_API_URL = "https://morytory-ai-worker.morytory.workers.dev/api/process-image";');
    console.log(`Is custom API URL fixed on live site? ${isCustomFixed}`);
    
    const lines = htmlCustom.split('\n');
    const apiLines = lines.filter(l => l.includes('WORKER_API_URL'));
    console.log('Fetched API URL lines:', apiLines);
    
  } catch (err) {
    console.error('Error fetching live site:', err.message);
  }
}
check();

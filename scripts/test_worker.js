async function test() {
  const urls = [
    'https://morytory-ai-worker.morytory.workers.dev/',
    'https://morytory-ai-worker.morytory.workers.dev/api/orders'
  ];
  for (const url of urls) {
    try {
      console.log(`Fetching: ${url}`);
      const res = await fetch(url);
      console.log(`  Status: ${res.status}`);
      const text = await res.text();
      console.log(`  Response: ${text.substring(0, 200)}`);
    } catch (err) {
      console.error(`  Error fetching ${url}:`, err.message);
    }
  }
}
test();

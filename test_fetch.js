async function test() {
  try {
    const res = await fetch('https://tmpfiles.org');
    console.log('Fetch ok, status:', res.status);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();

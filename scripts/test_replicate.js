const token = 'YOUR_REPLICATE_API_TOKEN';

async function testReplicate() {
  console.log("Calling Replicate predictions API...");
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: "278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
      input: {
        // Target image: standard photo of a group or couple with clear faces
        input_image: "https://raw.githubusercontent.com/replicate/codepen-demos/main/face-swap/target.jpg", 
        // Source image: face to swap in
        swap_image: "https://raw.githubusercontent.com/replicate/codepen-demos/main/face-swap/source.jpg"
      }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error starting prediction:", text);
    return;
  }

  let prediction = await res.json();
  const id = prediction.id;
  console.log(`Prediction started. ID: ${id}`);

  let status = prediction.status;
  while (status !== "succeeded" && status !== "failed" && status !== "canceled") {
    console.log(`Status: ${status}, waiting 2s...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (poll.ok) {
      prediction = await poll.json();
      status = prediction.status;
    }
  }

  console.log("Prediction finished with status:", status);
  if (status === "succeeded") {
    console.log("Output URL:", prediction.output);
  } else {
    console.log("Error details:", prediction.error);
  }
}

testReplicate().catch(console.error);

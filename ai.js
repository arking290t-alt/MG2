async function askAI(message) {
  const url =
    "https://mg-ai-backend-kksjbyhykfxrrq8dgx2tvn.streamlit.app/?message=" +
    encodeURIComponent(message);

  console.log("AI URL:", url);

  const res = await fetch(url);
  console.log("Response status:", res.status);

  const text = await res.text();
  console.log("Raw response:", text);

  const data = JSON.parse(text);
  return data.reply;
}

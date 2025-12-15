async function askAI(message) {
  const url =
    "https://mg-ai-backend-kksjbyhykfxrrq8dgx2tvn.streamlit.app/?message=" +
    encodeURIComponent(message);

  const res = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-store"
  });

  const text = await res.text();   // 👈 IMPORTANT
  console.log("AI raw response:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid JSON from AI");
  }

  if (!data.reply) {
    throw new Error("No reply field");
  }

  return data.reply;
}

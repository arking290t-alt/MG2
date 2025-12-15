async function askAI(message) {
  const url =
    "https://mg-ai.streamlit.app/?message=" +
    encodeURIComponent(message);

  const res = await fetch(url);
  const data = await res.json();
  return data.reply;
}

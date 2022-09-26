const writeEvent = (text, emisor) => {
  const messagesWrap = document.querySelector("#messages")  // <ul> element
  const el = document.createElement("li");   // <li> element
  el.classList.add(emisor);
  el.innerText = text;
  messagesWrap.appendChild(el);
  messagesWrap.scrollTo(0, document.querySelector("#messages").scrollHeight);
};
sock.on("message", writeEvent)

const onMessageSent = (e) => {
  e.preventDefault();
  const input =  document.querySelector("#msg");
  if (input.value) {
    const text = input.value;
    input.value = "";
    
    sock.emit("message", text, roomCode);
  };
};


document.querySelector("#chat-form").addEventListener("submit", onMessageSent);

const roomCode = new URLSearchParams(window.location.search).get("match");

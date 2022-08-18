const writeEvent = ([text, emisor]) => {
  const messagesWrap = document.querySelector("#messages")  // <ul> element
  const el = document.createElement("li");   // <li> element
  el.classList.add(emisor);
  el.innerText = text;
  messagesWrap.appendChild(el);
  messagesWrap.scrollTo(0, document.querySelector("#messages").scrollHeight);
};
sock.on("message", writeEvent)

const onFormSubmitted = (e) => {
  e.preventDefault();
  const input =  document.querySelector("#chat");
  if (input.value) {
    const text = input.value;
    input.value = "";
    
    sock.emit("message", text, room);
  };
};


document.querySelector("#chat-form").addEventListener("submit", onFormSubmitted);

const room = window.location.href.substring(window.location.href.length-5)
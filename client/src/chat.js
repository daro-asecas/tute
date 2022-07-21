
const writeEvent = ([text, emisor]) => {
  const parent = document.querySelector("#messages")  // <ul> element

  const el = document.createElement("li");   // <li> element
  el.classList.add(emisor);
  el.innerText = text;
  
  parent.appendChild(el);

  parent.scrollTo(0, document.querySelector("#messages").scrollHeight);
};

const onFormSubmitted = (e) => {
  e.preventDefault();
  const input =  document.querySelector("#chat");
  if (input.value) {
    const text = input.value;
    input.value = "";
    
    sock.emit("message", text, room);
  };
};


// const sock = io(); // lo dejo comentado porque esta definida en match
sock.on("message", writeEvent)

document
  .querySelector("#chat-form")
  .addEventListener("submit", onFormSubmitted);

const room = window.location.href.substring(window.location.href.length-5)
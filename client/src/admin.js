// Fuhciones de la consola
const writeEvent = ([text, textClass]) => {
  const messagesWrap = document.querySelector("#messages")  // <ul> element
  const el = document.createElement("li");   // <li> element
  el.classList.add(textClass);
  el.innerText = text;
  messagesWrap.appendChild(el);
  messagesWrap.scrollTo(0, document.querySelector("#messages").scrollHeight);
};
sock.on("response", writeEvent)


const sendCommand = (e) => {
  e.preventDefault();
  const input =  document.querySelector("#chat");
  if (input.value) {
    const text = input.value;
    input.value = "";
    writeEvent([text, "request"])

  sock.emit("command", text);
  };
};






// Fuhciones del panel del admin
const roomsPannel = document.querySelector("#rooms")

const requestReload = () => {
  roomsPannel.innerHTML = "";
  sock.emit("requestReload");
};

const reload = () => {
  // hacerla!!!!!!!!!!!!!!!!!!!!!!!!!;
};
sock.on("reload", reload)




document
  .querySelector("#reload")
  .addEventListener("clic", requestReload);

  document
  .querySelector("#chat-form")
  .addEventListener("submit", sendCommand);

requestReload();
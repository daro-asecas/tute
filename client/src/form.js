const decrementButtons = document.querySelectorAll(".stepper-input-modifiers.decrement")
const incrementButtons = document.querySelectorAll(".stepper-input-modifiers.increment")
const numberStepperInputs = document.querySelectorAll(".stepper")

// Number 'inputs'
const modifyStepper = (index, modification) => {
  if (numberStepperInputs[index].innerText === "∞") {numberStepperInputs[index].innerText = 0}
  const delta = (modification==="decrement")?(-1):(1)
  const max = parseInt(numberStepperInputs[index].getAttribute('max'))
  const min = parseInt(numberStepperInputs[index].getAttribute('min'))
  let numberToReturn = parseInt(numberStepperInputs[index].innerText) + delta
  if (numberToReturn === max+1) {numberToReturn = min
  } else if (numberToReturn === min-1) {numberToReturn = max}
  switch (index) {
    case 0:
      sock.emit("updateBotCount", numberToReturn)
    break
    case 1:      
      if ( numberToReturn === 0) { numberToReturn = "∞" }
      break
    }
  numberStepperInputs[index].innerText = numberToReturn
}


numberStepperInputs.forEach((input, index) => {
  decrementButtons[index].addEventListener("click", () => {modifyStepper(index, "decrement")})
  incrementButtons[index].addEventListener("click", () => {modifyStepper(index, "increment")})  
});


// Disable checkbox
const handLosesDouble = document.getElementById("hand-loses-double")
const redeal = document.getElementById("redeal")
let redealMemory

handLosesDouble.addEventListener("change", () => {disableRedealToggle()})

const disableRedealToggle = () => {
  if (handLosesDouble.checked) {
    redeal.checked = redealMemory
    redeal.disabled = false
  }
  else {
    redealMemory = redeal.checked
    redeal.checked = false
    redeal.disabled = true
  }
}




// Prompt for userName
const userNamePrompt = document.getElementById("user-name-prompt")
const userNameInput = document.getElementById("user-name")
const userNameSubmit = document.getElementById("submit-name")
const showUserNamePrompt = (() => { userNamePrompt.classList.remove("hidden") })
const hidUserNamePrompt = (() => { userNamePrompt.classList.add("hidden") })

if (!localStorage.userName) {
  showUserNamePrompt()
}

// userNameSubmit.addEventListener("click", () => {
//   if (!!userName) {  // ( "" === false )
//     localStorage.setItem("userName",userName);
//     hidUserNamePrompt()
//     sock.emit("newUserName" , localStorage.userName)
//   }
// })


const onNameSubmitted = (e) => {
  e.preventDefault()
  const userName = userNameInput.value.trim()
  if (!!userName) {  // ( "" === false )
    localStorage.setItem("userName",userName);
    hidUserNamePrompt()
    sock.emit("newUserName" , localStorage.userId, localStorage.userName)
  }
}
document.getElementById("user-name-form").addEventListener("submit", onNameSubmitted)


const emitForceStartgame = (e) => {
  e.preventDefault()
  e.target.closest(".prompt").classList.add("hidden")
  sock.emit("forceStartGame")
}
document.getElementById("add-bots-and-start-game").addEventListener("click", emitForceStartgame)


const closeParentPrompt = (e) => {
  e.preventDefault()
  e.target.closest(".prompt").classList.add("hidden")
}
document.querySelector(".close-prompt-button").addEventListener("click", closeParentPrompt)
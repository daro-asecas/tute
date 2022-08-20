const decrementButtons = document.querySelectorAll(".stepper-input-modifiers.decrement")
const incrementButtons = document.querySelectorAll(".stepper-input-modifiers.increment")
const numberStepperInputs = document.querySelectorAll(".stepper")

// Number 'inputs'
const modifyStepper = (index, modification) => {
  if (numberStepperInputs[index].innerText === "∞") {numberStepperInputs[index].innerText = 0}
  const delta = (modification==="decrement")?(-1):(1)
  const max = numberStepperInputs[index].getAttribute('max')
  const min = numberStepperInputs[index].getAttribute('min')
  let numberToReturn = parseInt(numberStepperInputs[index].innerText) + delta
  if (numberToReturn === parseInt(max) + 1) {numberToReturn = min
  } else if (numberToReturn === parseInt(min) - 1) {numberToReturn = max}
  switch (index) {
    case 0:
      sock.emit("updateBotCount", numberToReturn)
    break
    case 1:      
      if ( numberToReturn == 0) { numberToReturn = "∞" }
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
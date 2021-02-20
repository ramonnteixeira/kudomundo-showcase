const confettiCount = 30
const sequinCount = 15

// "physics" variables
const gravityConfetti = 0.4
const gravitySequins = 0.55
const dragConfetti = 0.375
const dragSequins = 0.32
const terminalVelocity = 5

// add Confetto/Sequin objects to arrays to draw them
let confetti = []
let sequins = []

// colors, back side is darker for confetti flipping
const colors = [
  { front : '#7b5cff', back: '#6245e0' }, // Purple
  { front : '#b3c7ff', back: '#8fa5e5' }, // Light Blue
  { front : '#5c86ff', back: '#345dd1' }  // Darker Blue
]

// helper function to pick a random number within a range
const randomRange = (min, max) => Math.random() * (max - min) + min

// helper function to get initial velocities for confetti
// this weighted spread helps the confetti look more realistic
const initConfettoVelocity = (xRange, yRange) => {
  const x = randomRange(xRange[0], xRange[1])
  const range = yRange[1] - yRange[0] + 1
  let y = yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range)
  if (y >= yRange[1] - 1) {
    // Occasional confetto goes higher than the max
    y += (Math.random() < .25) ? randomRange(1, 3) : 0
  }
  return {x: x, y: -y}
}

export class Confetto {
  canvas: HTMLCanvasElement;
  button: HTMLButtonElement;
  randomModifier;
  color;
  dimensions;
  position;
  rotation;
  scale;
  velocity;

  constructor(canvas: HTMLCanvasElement, button: HTMLButtonElement) {
    this.canvas = canvas;
    this.button = button;

    this.randomModifier = randomRange(0, 99)
    this.color = colors[Math.floor(randomRange(0, colors.length))]
    this.dimensions = {
      x: randomRange(5, 9),
      y: randomRange(8, 15),
    }
    this.position = {
      x: randomRange(canvas.width/2 - button.offsetWidth/4, canvas.width/2 + button.offsetWidth/4),
      y: randomRange(canvas.height/2 + button.offsetHeight/2 + 8, canvas.height/2 + (1.5 * button.offsetHeight) - 8),
    }
    this.rotation = randomRange(0, 2 * Math.PI)
    this.scale = {
      x: 1,
      y: 1,
    }
    this.velocity = initConfettoVelocity([-9, 9], [6, 11])
  }

  update() {
    // apply forces to velocity
    this.velocity.x -= this.velocity.x * dragConfetti
    this.velocity.y = Math.min(this.velocity.y + gravityConfetti, terminalVelocity)
    this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random()

    // set position
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // spin confetto by scaling y and set the color, .09 just slows cosine frequency
    this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09)
  }
}

export class Sequin {
  canvas: HTMLCanvasElement;
  button: HTMLButtonElement;
  color;
  radius;
  position;
  velocity;

  constructor(canvas: HTMLCanvasElement, button: HTMLButtonElement) {
    this.canvas = canvas;
    this.button = button;

    this.color = colors[Math.floor(randomRange(0, colors.length))].back,
    this.radius = randomRange(1, 2),
    this.position = {
      x: randomRange(canvas.width/2 - button.offsetWidth/3, canvas.width/2 + button.offsetWidth/3),
      y: randomRange(canvas.height/2 + button.offsetHeight/2 + 8, canvas.height/2 + (1.5 * button.offsetHeight) - 8),
    },
    this.velocity = {
      x: randomRange(-6, 6),
      y: randomRange(-8, -12)
    }
  }

  update() {
    // apply forces to velocity
    this.velocity.x -= this.velocity.x * dragSequins
    this.velocity.y = this.velocity.y + gravitySequins

    // set position
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }

}

export const initBurst = (canvas: HTMLCanvasElement, button: HTMLButtonElement) => {
  confetti = [];
  sequins = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push(new Confetto(canvas, button))
  }
  for (let i = 0; i < sequinCount; i++) {
    sequins.push(new Sequin(canvas, button))
  }

  const render = () => {
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    confetti.forEach(confetto => {
      let width = (confetto.dimensions.x * confetto.scale.x)
      let height = (confetto.dimensions.y * confetto.scale.y)

      // move canvas to position and rotate
      ctx.translate(confetto.position.x, confetto.position.y)
      ctx.rotate(confetto.rotation)

      // update confetto "physics" values
      confetto.update()

      // get front or back fill color
      ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back

      // draw confetto
      ctx.fillRect(-width / 2, -height / 2, width, height)

      // reset transform matrix
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      // clear rectangle where button cuts off
      if (confetto.velocity.y < 0) {
        ctx.clearRect(canvas.width/2 - button.offsetWidth/2, canvas.height/2 + button.offsetHeight/2, button.offsetWidth, button.offsetHeight)
      }
    })

    sequins.forEach(sequin => {
      // move canvas to position
      ctx.translate(sequin.position.x, sequin.position.y)

      // update sequin "physics" values
      sequin.update()

      // set the color
      ctx.fillStyle = sequin.color

      // draw sequin
      ctx.beginPath()
      ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI)
      ctx.fill()

      // reset transform matrix
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      // clear rectangle where button cuts off
      if (sequin.velocity.y < 0) {
        ctx.clearRect(canvas.width/2 - button.offsetWidth/2, canvas.height/2 + button.offsetHeight/2, button.offsetWidth, button.offsetHeight)
      }
    })

    // remove confetti and sequins that fall off the screen
    // must be done in seperate loops to avoid noticeable flickering
    confetti.forEach((confetto, index) => {
      if (confetto.position.y >= canvas.height) confetti.splice(index, 1)
    })
    sequins.forEach((sequin, index) => {
      if (sequin.position.y >= canvas.height) sequins.splice(index, 1)
    })
  }

  const fpsInterval = 1000 / 50;
  let now, then, elapsed;
  // initialize the timer variables and start the animation

  function startAnimating() {
      then = Date.now();
      animate();
  }

  function animate() {
    requestAnimationFrame(animate);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      then = now - (elapsed % fpsInterval);

      // Put your drawing code here
      render();
    }
  }

  return startAnimating();
}

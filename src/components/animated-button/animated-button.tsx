import { Component, Prop, h } from '@stencil/core';
import { initBurst } from './burst-effect/confetto';

/**
 * Component based on (https://codepen.io/coopergoeke/details/wvaYMbJ)[coopergoeke]
 *
 * @export
 * @class AnimatedButton
 */
@Component({
  tag: 'animated-button',
  styleUrl: 'animated-button.scss',
  shadow: true,
})
export class AnimatedButton {
  /**
   * The button text
   *
   * @type {string}
   * @memberof AnimatedButton
   */
  @Prop() text: string;

  /**
   * The success text
   *
   * @type {string}
   * @memberof AnimatedButton
   */
  @Prop() success: string;

  /**
   * Action executed during the animation
   * Use a async function or return a promise
   *
   * @type {Function}
   * @memberof AnimatedButton
   */
  @Prop() action: Function;

  /**
   * Disable burst effect
   *
   * @type {boolean}
   * @memberof AnimatedButton
   */
  @Prop() disableBurst: boolean;

  private button?: HTMLButtonElement;
  private canvas?: HTMLCanvasElement;
  private disabled = false;

  private reset() {
    this.disabled = false
    this.button.classList.add('ready')
    this.button.classList.remove('complete')
  }

  private clickButton() {
    if (!this.action) {
      console.warn('Action is not definied!')
      return;
    }

    if (!this.disabled) {
      this.disabled = true
      // Loading stage
      this.button.classList.add('loading')
      this.button.classList.remove('ready')
      setTimeout(async() => {
        try {
          await this.action()
          this.button.classList.add('complete')
          this.button.classList.remove('loading')
          setTimeout(() => {
            this.burst()
            setTimeout(() => {
              this.reset()
            }, 4000)
          }, 320)
        } catch (error) {
          console.error(error)
          this.button.classList.remove('loading')
          this.reset()
        }
      }, 200)
    }
  }

  private burst() {
    if (!this.disableBurst) {
      initBurst(this.canvas, this.button);
    }
  }

  private animatedLetters(text: string) {
    if (!text) return '';
    let characterHTML = ''
    text.split('').forEach((letter, index) => {
      characterHTML += `<span class="char${index}" style="--d:${index * 30}ms; --dr:${(text.length - index - 1) * 30}ms;">${letter}</span>`
    })
    return characterHTML
  }

  componentDidMount() {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    }

    // resize listenter
    window.addEventListener('resize', () => {
      resizeCanvas()
    })
  }

  render() {
    return <span>
      <button ref={el => this.button = el as HTMLButtonElement}
       class="ready" onClick={() => this.clickButton()}
       part="whitelabel">
        <div class="message submitMessage">
          <span class="button-text" innerHTML={this.animatedLetters(this.text)}></span>
          {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 12.2">
            <polyline stroke="currentColor" points="2,7.1 6.5,11.1 11,7.1 " />
            <line stroke="currentColor" x1="6.5" y1="1.2" x2="6.5" y2="10.3" />
          </svg> */}
        </div>

        <div class="message loadingMessage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 17">
            <circle class="loadingCircle" cx="2.2" cy="10" r="1.6" />
            <circle class="loadingCircle" cx="9.5" cy="10" r="1.6" />
            <circle class="loadingCircle" cx="16.8" cy="10" r="1.6" />
          </svg>
        </div>

        <div class="message successMessage">
          <span class="button-text" innerHTML={this.animatedLetters(this.success)}></span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 11">
            <polyline stroke="currentColor" points="1.4,5.8 5.1,9.5 11.6,2.1 " />
          </svg>
        </div>

      </button>
      <canvas ref={el => this.canvas = el as HTMLCanvasElement}></canvas>
    </span>
  }
}

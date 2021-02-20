import { newSpecPage } from '@stencil/core/testing';
import { MyComponent } from './animated-button';

xdescribe('animated-button', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [MyComponent],
      html: '<animated-button></animated-button>',
    });
    expect(root).toEqualHtml(`
      <animated-button>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </animated-button>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [MyComponent],
      html: `<animated-button first="Stencil" last="'Don't call me a framework' JS"></animated-button>`,
    });
    expect(root).toEqualHtml(`
      <animated-button first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </animated-button>
    `);
  });
});

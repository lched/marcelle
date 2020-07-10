import { Module } from '../../core/module';
import { click, text as textObs } from './button.store';
import Component from './button.svelte';

export class Button extends Module {
  name = 'button';
  description = 'just a button...';

  constructor({ text = 'click me' } = {}) {
    super();
    this.defineProp('text', textObs, text);
    this.out.click = click;
  }

  mount(): void {
    const target = document.querySelector(`#${this.id}`);
    if (!target) return;
    this.app = new Component({ target });
  }
}

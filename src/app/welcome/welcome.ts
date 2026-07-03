import { AfterViewInit, Component, ElementRef, OnDestroy, computed, signal, viewChild } from '@angular/core';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#';

class Scramble {
  private frame = 0;
  private frameRequest = 0;
  private queue: { from: string; to: string; start: number; end: number; char?: string }[] = [];

  constructor(private readonly el: HTMLElement) {}

  play(text: string, delay = 0): void {
    setTimeout(() => this.start(text), delay);
  }

  stop(): void {
    cancelAnimationFrame(this.frameRequest);
  }

  private start(text: string): void {
    const from = this.el.textContent ?? '';
    const length = Math.max(from.length, text.length);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20) + 15;
      this.queue.push({ from: from[i] ?? '', to: text[i] ?? '', start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
  }

  private readonly update = (): void => {
    let output = '';
    let complete = 0;
    for (const item of this.queue) {
      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        output += item.char;
      } else {
        output += item.from;
      }
    }
    this.el.textContent = output;
    if (complete < this.queue.length) {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  };
}

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome implements AfterViewInit, OnDestroy {
  protected readonly wrapTransform = computed(() => {
    const { x, y } = this.pointer();
    const rx = (y - 0.5) * -16;
    const ry = (x - 0.5) * 20;
    return `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  private readonly pointer = signal({ x: 0.5, y: 0.5 });
  private readonly beforeText = viewChild.required<ElementRef<HTMLElement>>('beforeText');
  private readonly nameText = viewChild.required<ElementRef<HTMLElement>>('nameText');
  private readonly afterText = viewChild.required<ElementRef<HTMLElement>>('afterText');
  private scrambles: Scramble[] = [];

  ngAfterViewInit(): void {
    const before = new Scramble(this.beforeText().nativeElement);
    const name = new Scramble(this.nameText().nativeElement);
    const after = new Scramble(this.afterText().nativeElement);
    this.scrambles = [before, name, after];
    before.play('Welcome to', 150);
    name.play("Dhairya's", 450);
    after.play('World', 750);
  }

  ngOnDestroy(): void {
    this.scrambles.forEach((s) => s.stop());
  }

  protected onMouseMove(event: MouseEvent): void {
    this.pointer.set({
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight,
    });
  }
}

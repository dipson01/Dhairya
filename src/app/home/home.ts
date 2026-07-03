import { AfterViewInit, Component, ElementRef, OnDestroy, computed, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#';

class Scramble {
  onComplete?: () => void;

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
    } else {
      this.onComplete?.();
    }
  };
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit, OnDestroy {
  protected readonly zooming = signal(false);
  protected readonly hintVisible = signal(false);

  protected readonly wrapTransform = computed(() => {
    if (this.zooming()) {
      return 'rotateX(0deg) rotateY(0deg)';
    }
    const { x, y } = this.pointer();
    const rx = 12 - (y - 0.5) * 24;
    const ry = -14 + (x - 0.5) * 28;
    return `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  private readonly pointer = signal({ x: 0.5, y: 0.5 });
  private readonly enText = viewChild.required<ElementRef<HTMLElement>>('enText');
  private readonly neText = viewChild.required<ElementRef<HTMLElement>>('neText');
  private enScramble?: Scramble;
  private neScramble?: Scramble;

  constructor(private readonly router: Router) {}

  ngAfterViewInit(): void {
    this.enScramble = new Scramble(this.enText().nativeElement);
    this.neScramble = new Scramble(this.neText().nativeElement);
    this.enScramble.play('Dhairya', 150);
    this.neScramble.play('धैर्य', 550);
    this.neScramble.onComplete = () => this.hintVisible.set(true);
  }

  ngOnDestroy(): void {
    this.enScramble?.stop();
    this.neScramble?.stop();
  }

  protected onMouseMove(event: MouseEvent): void {
    if (this.zooming()) {
      return;
    }
    this.pointer.set({
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight,
    });
  }

  protected enter(): void {
    if (this.zooming()) {
      return;
    }
    this.zooming.set(true);
    setTimeout(() => this.router.navigateByUrl('/welcome'), 600);
  }
}

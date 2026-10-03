import { AfterViewChecked, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { ParticlesComponent } from './particles/particles.component';

declare var emailjs: any;

type FieldKey = 'from_name' | 'email' | 'asunto' | 'mensaje' | 'acepto_politica';

interface Step {
  key: FieldKey;
  /** Mensajes del asistente antes de pedir el dato */
  ask: (data: Record<FieldKey, string>) => string[];
  input: 'text' | 'email' | 'textarea' | 'none';
  placeholder?: string;
  chips?: string[];
  chipsOnly?: boolean;
  validate: (value: string) => string | null; // devuelve un error o null
}

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  step?: number;     // en mensajes del usuario: a qué paso responde (para poder editarlo)
  error?: boolean;
}

type Status = 'chatting' | 'review' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule, RevealDirective, ParticlesComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('thread') thread?: ElementRef<HTMLElement>;
  @ViewChild('field') field?: ElementRef<HTMLInputElement | HTMLTextAreaElement>;
  @ViewChild('card') card?: ElementRef<HTMLElement>;

  // ---- EmailJS (mismos datos que antes) ----
  private readonly serviceID = 'service_1fd29qg';
  private readonly templateID = 'template_lhkn88h';
  private readonly publicKey = 'MozjG_1EF6MduDcEx';

  readonly steps: Step[] = [
    {
      key: 'from_name',
      ask: () => ['¡Hola! 👋 Soy el asistente de Juan.', 'Te ayudo a dejarle un mensaje en unos segundos. ¿Cómo te llamas?'],
      input: 'text',
      placeholder: 'Escribe tu nombre…',
      validate: v => (v.trim().length < 2 ? 'Necesito al menos 2 letras 😉' : null),
    },
    {
      key: 'email',
      ask: d => [`¡Encantado, ${this.firstName(d.from_name)}!`, '¿A qué email puede responderte Juan?'],
      input: 'email',
      placeholder: 'tu@email.com',
      validate: v => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Mmm… ese email no parece válido. ¿Lo revisas?'),
    },
    {
      key: 'asunto',
      ask: () => ['¿De qué quieres hablar? Elige una opción o escribe la tuya.'],
      input: 'text',
      placeholder: 'Asunto…',
      chips: ['Proyecto web', 'App móvil', 'Colaboración', 'Oferta de trabajo', 'Solo saludar'],
      validate: v => (v.trim().length < 2 ? 'Escribe un asunto un poco más largo.' : null),
    },
    {
      key: 'mensaje',
      ask: d => [`«${d.asunto}», ¡me gusta! Cuéntame un poco más.`],
      input: 'textarea',
      placeholder: 'Tu mensaje… (Enter para enviar, Shift+Enter para salto de línea)',
      validate: v => (v.trim().length < 5 ? 'Cuéntame un poquito más (mínimo 5 caracteres).' : null),
    },
    {
      key: 'acepto_politica',
      ask: () => ['Último paso: ¿aceptas la política de privacidad para que Juan pueda responderte?'],
      input: 'none',
      chips: ['Sí, acepto ✓'],
      chipsOnly: true,
      validate: () => null,
    },
  ];

  readonly word = 'Hablemos.'.split('');

  data: Record<FieldKey, string> = { from_name: '', email: '', asunto: '', mensaje: '', acepto_politica: '' };
  messages: ChatMessage[] = [];
  stepIndex = 0;
  value = '';
  botTyping = false;
  status: Status = 'chatting';
  shake = false;
  started = false;
  madridTime = '';
  confetti: { x: number; y: number; r: number; c: string; d: number }[] = [];

  private timers: ReturnType<typeof setTimeout>[] = [];
  private clock?: ReturnType<typeof setInterval>;
  private needsScroll = false;
  private startObserver?: IntersectionObserver;

  constructor(
    private notificationService: NotificationService,
    private zone: NgZone,
    private host: ElementRef<HTMLElement>,
  ) {
    if (typeof emailjs !== 'undefined') emailjs.init(this.publicKey);
  }

  get step(): Step | null {
    return this.status === 'chatting' ? this.steps[this.stepIndex] ?? null : null;
  }

  get hasUserReply(): boolean {
    return this.messages.some(m => m.from === 'user');
  }

  get progress(): number {
    if (this.status !== 'chatting') return 100;
    return Math.round((this.stepIndex / this.steps.length) * 100);
  }

  ngOnInit(): void {
    this.updateClock();
    this.clock = setInterval(() => this.updateClock(), 1000 * 15);

    // El chat "arranca" cuando la sección entra en pantalla
    if (typeof IntersectionObserver === 'undefined') { this.start(); return; }
    this.startObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) this.zone.run(() => this.start());
    }, { threshold: 0.3 });
    this.startObserver.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearTimeout(t));
    if (this.clock) clearInterval(this.clock);
    this.startObserver?.disconnect();
  }

  ngAfterViewChecked(): void {
    if (this.needsScroll && this.thread) {
      const el = this.thread.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      this.needsScroll = false;
    }
  }

  // ---------------- Chat ----------------

  private start(): void {
    if (this.started) return;
    this.started = true;
    this.startObserver?.disconnect();
    this.askStep(0);
  }

  /** El asistente "escribe" sus mensajes uno a uno */
  private botSay(lines: string[], done?: () => void): void {
    let delay = 0;
    lines.forEach((text, i) => {
      const typing = Math.min(1100, 350 + text.length * 14);
      this.later(() => { this.botTyping = true; this.needsScroll = true; }, delay);
      delay += typing;
      this.later(() => {
        this.botTyping = false;
        this.messages.push({ from: 'bot', text });
        this.needsScroll = true;
        if (i === lines.length - 1) done?.();
      }, delay);
      delay += 180;
    });
  }

  private askStep(index: number): void {
    this.stepIndex = index;
    this.value = this.data[this.steps[index].key] || '';
    this.botSay(this.steps[index].ask(this.data), () => this.focusField());
  }

  submit(raw?: string): void {
    const step = this.step;
    if (!step || this.botTyping) return;
    const value = (raw ?? this.value).trim();
    if (!value) { this.flagError(); return; }

    const error = step.validate(value);
    const userMsg: ChatMessage = { from: 'user', text: value, step: this.stepIndex, error: !!error };
    this.messages.push(userMsg);
    this.needsScroll = true;
    this.value = '';

    if (error) {
      this.flagError();
      this.botSay([error], () => this.focusField());
      return;
    }

    this.data[step.key] = step.key === 'acepto_politica' ? 'Sí' : value;
    const next = this.stepIndex + 1;
    if (next < this.steps.length) {
      this.askStep(next);
    } else {
      this.stepIndex = next;
      this.botSay(['¡Perfecto! Revisa tu mensaje y lánzalo 🚀'], () => (this.status = 'review'));
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  /** Tocar una respuesta tuya permite corregirla */
  edit(msg: ChatMessage): void {
    if (msg.from !== 'user' || msg.step === undefined || this.status === 'sending' || this.status === 'sent') return;
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.botTyping = false;
    this.status = 'chatting';

    // Borramos desde la respuesta elegida en adelante y volvemos a ese paso
    const idx = this.messages.indexOf(msg);
    this.messages = this.messages.slice(0, idx);
    this.stepIndex = msg.step;
    this.value = msg.text;
    this.messages.push({ from: 'bot', text: 'Sin problema, corrígelo aquí 👇' });
    this.needsScroll = true;
    this.focusField();
  }

  restart(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.data = { from_name: '', email: '', asunto: '', mensaje: '', acepto_politica: '' };
    this.messages = [];
    this.status = 'chatting';
    this.confetti = [];
    this.askStep(0);
  }

  // ---------------- Envío ----------------

  send(): void {
    if (this.status !== 'review' && this.status !== 'error') return;
    if (typeof emailjs === 'undefined') {
      this.status = 'error';
      return;
    }
    this.status = 'sending';

    const minAnim = new Promise(resolve => setTimeout(resolve, 1400)); // deja ver el avión despegar
    Promise.all([emailjs.send(this.serviceID, this.templateID, { ...this.data }), minAnim])
      .then(() => this.zone.run(() => {
        this.status = 'sent';
        this.launchConfetti();
        this.later(() => this.notificationService.notify('formSentSuccess'), 6000);
      }))
      .catch((err: unknown) => this.zone.run(() => {
        console.error('Error al enviar email:', err);
        this.status = 'error';
      }));
  }

  private launchConfetti(): void {
    const colors = ['#8dc855', '#a8ec6a', '#ffffff', '#f7d046', '#5ad1a0'];
    this.confetti = Array.from({ length: 46 }, () => ({
      x: (Math.random() - 0.5) * 520,
      y: -(Math.random() * 300 + 120),
      r: Math.random() * 720 - 360,
      c: colors[Math.floor(Math.random() * colors.length)],
      d: Math.random() * 0.25,
    }));
  }

  // ---------------- Efecto 3D de la tarjeta ----------------

  onCardMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || !this.card) return;
    const el = this.card.nativeElement;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--rx', `${(0.5 - py) * 5}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 7}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
  }

  onCardLeave(): void {
    if (!this.card) return;
    const el = this.card.nativeElement;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  /** Foco de luz que sigue al puntero por toda la sección */
  onSectionMove(event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }

  // ---------------- Utilidades ----------------

  private flagError(): void {
    this.shake = true;
    this.later(() => (this.shake = false), 500);
  }

  private focusField(): void {
    // En móvil no abrimos el teclado solo, para no tapar la pantalla
    if (window.matchMedia?.('(pointer: coarse)').matches) return;
    this.later(() => this.field?.nativeElement.focus({ preventScroll: true }), 30);
  }

  private firstName(name: string): string {
    return name.trim().split(/\s+/)[0] || name;
  }

  private updateClock(): void {
    try {
      this.madridTime = new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
      }).format(new Date());
    } catch {
      this.madridTime = '';
    }
  }

  private later(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }
}

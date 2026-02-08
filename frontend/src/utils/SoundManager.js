class SoundManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.muted = localStorage.getItem('game_muted') === 'true';
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    setMuted(mute) {
        this.muted = mute;
        localStorage.setItem('game_muted', mute);
    }

    // Generic tone generator
    playTone(freq, type = 'sine', duration = 0.1, vol = 0.5, slide = 0) {
        if (!this.initialized) this.init();
        if (this.muted || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slide) {
            osc.frequency.linearRampToValueAtTime(freq + slide, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    play(soundName) {
        if (!this.initialized) this.init();

        // Resume context if suspended (browser policy)
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        switch (soundName) {
            case 'click':
                this.playTone(600, 'sine', 0.1, 0.2);
                break;
            case 'tick': // Wheel tick
                this.playTone(800, 'square', 0.03, 0.1);
                break;
            case 'spin': // Rolling sound / Engine
                this.playTone(200, 'sawtooth', 0.5, 0.1, 200);
                break;
            case 'scratch':
                // White noise approximation
                this.playTone(Math.random() * 500 + 200, 'sawtooth', 0.05, 0.1);
                break;
            case 'success':
            case 'coin':
                this.playTone(1200, 'sine', 0.15, 0.3);
                setTimeout(() => this.playTone(1800, 'sine', 0.3, 0.3), 100);
                break;
            case 'win':
            case 'jackpot':
                // Arpeggio
                [0, 150, 300, 450].forEach((delay, i) => {
                    setTimeout(() => {
                        this.playTone(800 + (i * 200), 'triangle', 0.3, 0.4);
                    }, delay);
                });
                break;
            case 'failure':
            case 'bomb':
                this.playTone(150, 'sawtooth', 0.4, 0.4, -100);
                break;
            default:
                break;
        }
    }
}

export default new SoundManager();

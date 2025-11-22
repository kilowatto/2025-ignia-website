/**
 * Hero Particles Animation
 * Creates a subtle particle effect that follows the mouse cursor.
 * Designed to be lightweight and non-blocking.
 */

class ParticleSystem {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Particle[] = [];
    private mouse = { x: 0, y: 0 };
    private isActive = false;
    private resizeObserver: ResizeObserver;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');
        this.ctx = context;

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas);

        this.init();
    }

    private init() {
        this.resize();
        this.isActive = true;

        // Mouse move listener
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        // Start animation loop
        this.animate();
    }

    private resize() {
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
        }
    }

    private createParticle() {
        // Increased spawn rate: Create multiple particles or more frequently
        // 30% chance to spawn a particle per frame (up from 10%)
        if (Math.random() > 0.3) return;

        const x = this.mouse.x + (Math.random() - 0.5) * 60;
        const y = this.mouse.y + (Math.random() - 0.5) * 60;

        this.particles.push(new Particle(x, y));
    }

    private animate() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Create new particles near mouse
        this.createParticle();

        // Update and draw existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.ctx);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    public destroy() {
        this.isActive = false;
        this.resizeObserver.disconnect();
    }
}

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
    color: string;
    angle: number;
    rotationSpeed: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        // Random velocity - slightly faster for more dynamic feel
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1.0; // 100% life
        this.size = Math.random() * 8 + 4; // Larger size for hexagons (4-12px)

        // Ignia Orange only
        this.color = '249, 115, 22'; // Orange-500

        // Rotation
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;
        this.life -= 0.01; // Slower fade out for longer life
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        // Draw Hexagon
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = Math.cos(angle) * this.size;
            const hy = Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();

        // Stroke only (outline)
        ctx.strokeStyle = `rgba(${this.color}, ${this.life * 0.6})`; // Higher opacity
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-particles') as HTMLCanvasElement;
    if (canvas) {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            new ParticleSystem(canvas);
        }
    }
});

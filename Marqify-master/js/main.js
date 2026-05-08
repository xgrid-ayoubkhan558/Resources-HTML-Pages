(function () {
    class PureMarquee {
        constructor(el, options = {}) {
            this.el = el;
            this.track = el.querySelector('.pm-marquee__track');

            // Options + defaults
            this.speed = options.speed ?? parseFloat(el.dataset.speed) ?? 0.5;
            this.direction = options.direction ?? el.dataset.direction ?? 'left';
            this.customClasses = options.customClasses ?? {}; // {inView, passed, toCome}
            this.vertical = options.vertical ?? false;
            this.pauseOnHover = options.pauseOnHover ?? true;

            this.pos = 0;
            this.items = Array.from(this.track.children);
            this.raf = null;

            this.init();
        }

        init() {
            this.cloneUntilFilled();
            this.setupHoverPause();
            this.setupResizeObserver();
            this.updateClasses();
            this.start();
        }

        cloneUntilFilled() {
            const containerSize = this.vertical ? this.el.offsetHeight : this.el.offsetWidth;
            let trackSize = this.vertical ? this.track.scrollHeight : this.track.scrollWidth;

            while (trackSize < containerSize * 2) {
                this.items.forEach(item => this.track.appendChild(item.cloneNode(true)));
                trackSize = this.vertical ? this.track.scrollHeight : this.track.scrollWidth;
            }
        }

        setupHoverPause() {
            if (!this.pauseOnHover) return;
            this.el.addEventListener('mouseenter', () => cancelAnimationFrame(this.raf));
            this.el.addEventListener('mouseleave', () => this.start());
        }

        setupResizeObserver() {
            if (!window.ResizeObserver) return;
            const observer = new ResizeObserver(() => {
                cancelAnimationFrame(this.raf);
                this.cloneUntilFilled();
                this.start();
            });
            observer.observe(this.el);
        }

        updateClasses() {
            const inViewClass = this.customClasses.inView ?? 'pm-in-view';
            const toComeClass = this.customClasses.toCome ?? 'pm-to-come';
            const passedClass = this.customClasses.passed ?? 'pm-passed';

            const items = Array.from(this.track.children);

            items.forEach((item, i) => {
                if (i === 0) item.classList.add(inViewClass);
                else item.classList.add(toComeClass);
            });

            this.classCycle = { inViewClass, toComeClass, passedClass };
        }

        start() {
            const step = () => {
                const move = this.speed * (this.direction === 'left' || this.direction === 'up' ? -1 : 1);
                this.pos += move;

                const resetPoint = this.vertical ? this.track.scrollHeight / 2 : this.track.scrollWidth / 2;
                if (Math.abs(this.pos) >= resetPoint) this.pos = 0;

                if (this.vertical) this.track.style.transform = `translateY(${this.pos}px)`;
                else this.track.style.transform = `translateX(${this.pos}px)`;

                this.raf = requestAnimationFrame(step);
            };

            step();
        }

        destroy() {
            cancelAnimationFrame(this.raf);
        }
    }

    // Auto-init in browser
    if (typeof window !== 'undefined') {
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('[data-marquee], .pm-marquee')
                .forEach(el => new PureMarquee(el));
        });
    }

    window.PureMarquee = PureMarquee;
})();

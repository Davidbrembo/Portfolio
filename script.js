document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- 1. ANIMAZIONI SCROLL (Intersection Observer) con effetto a cascata ---
    const reveals = document.querySelectorAll('.reveal');

    // Ritardo progressivo per gli elementi fratelli (card, timeline, ecc.)
    reveals.forEach(el => {
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        const index = siblings.indexOf(el);
        if (index > 0) el.style.setProperty('--delay', `${index * 0.1}s`);
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        reveals.forEach(el => revealObserver.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('active'));
    }

    // --- 2. EFFETTO MACCHINA DA SCRIVERE (con più frasi a rotazione) ---
    const typed = document.getElementById('typed');
    if (typed) {
        let words;
        try { words = JSON.parse(typed.dataset.words); } catch { words = [typed.textContent]; }

        if (reduceMotion) {
            typed.textContent = words[0];
        } else {
            let w = 0, i = 0, deleting = false;
            typed.textContent = '';

            const tick = () => {
                const word = words[w];
                typed.textContent = word.slice(0, i);

                let delay = deleting ? 35 : 70;
                if (!deleting && i === word.length) {
                    delay = 1800;
                    deleting = true;
                } else if (deleting && i === 0) {
                    deleting = false;
                    w = (w + 1) % words.length;
                    delay = 400;
                } else {
                    i += deleting ? -1 : 1;
                }
                setTimeout(tick, delay);
            };
            setTimeout(tick, 600);
        }
    }

    // --- 3. NAVBAR: sfondo allo scroll, nascondi/mostra, link attivo ---
    const nav = document.getElementById('navbar');
    const progress = document.querySelector('.scroll-progress');
    const backToTop = document.querySelector('.back-to-top');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        nav.classList.toggle('scrolled', y > 30);
        const menuOpen = navLinks.classList.contains('open');
        nav.classList.toggle('hidden', !menuOpen && y > lastY && y > 400);
        lastY = y;

        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        backToTop.classList.toggle('show', y > 600);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    // Evidenzia la voce di menu della sezione visibile
    const sectionLinks = new Map(
        [...navLinks.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a])
    );
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sectionLinks.forEach(a => a.classList.remove('active'));
                sectionLinks.get(entry.target.id)?.classList.add('active');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));

    // --- 4. MENU HAMBURGER (mobile) ---
    const setMenu = open => {
        navLinks.classList.toggle('open', open);
        menuToggle.classList.toggle('open', open);
        nav.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
        document.body.style.overflow = open ? 'hidden' : '';
    };
    menuToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    // --- 5. EFFETTI MOUSE (solo dispositivi con puntatore) ---
    if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
        const glow = document.querySelector('.cursor-glow');
        window.addEventListener('mousemove', e => {
            glow.style.left = `${e.clientX}px`;
            glow.style.top = `${e.clientY}px`;
        }, { passive: true });

        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        });
    }

    // --- 6. INVIO FORM SENZA LASCIARE LA PAGINA (Formspree) ---
    const form = document.getElementById('contact-form');
    if (form) {
        const status = form.querySelector('.form-status');
        const button = form.querySelector('button[type="submit"]');
        const label = button.querySelector('span');

        form.addEventListener('submit', async e => {
            e.preventDefault();
            button.disabled = true;
            label.textContent = 'Invio in corso...';
            status.className = 'form-status';
            status.textContent = '';

            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });
                if (!res.ok) throw new Error();
                form.reset();
                status.classList.add('ok');
                status.textContent = 'Grazie! Il tuo messaggio è stato inviato.';
            } catch {
                status.classList.add('err');
                status.textContent = 'Ops, qualcosa è andato storto. Riprova o scrivimi via email.';
            } finally {
                button.disabled = false;
                label.textContent = 'Invia Messaggio';
            }
        });
    }

    // --- 7. ANNO NEL FOOTER ---
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});

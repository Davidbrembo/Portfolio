document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ANIMAZIONI SCROLL (Intersection Observer) ---
    const reveals = document.querySelectorAll('.reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // --- 2. EFFETTO MACCHINA DA SCRIVERE (Typing Effect) ---
    const typingElement = document.querySelector('.hero-content h2');
    
    if (typingElement) {
        const text = typingElement.textContent; // Prende il testo originale dall'HTML
        typingElement.textContent = ""; // Svuota l'elemento
        typingElement.classList.add('typing'); // Aggiunge il cursore lampeggiante

        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                typingElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50); // Velocità di digitazione (50ms)
            }
        }
        
        // Avvia l'effetto dopo mezzo secondo che la pagina è caricata
        setTimeout(typeWriter, 500);
    }

});

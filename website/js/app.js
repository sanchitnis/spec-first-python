// ============================================
// Formal Methods + AI Course Website Scripts
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // Smooth scroll for navigation links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ============================================
    // Navbar background on scroll
    // ============================================
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // Animate metric bars on scroll
    // ============================================
    const metricBars = document.querySelectorAll('.metric-fill');
    const metricObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
                metricObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    metricBars.forEach(bar => metricObserver.observe(bar));
    
    // ============================================
    // Animate cards on scroll
    // ============================================
    const animateElements = document.querySelectorAll(
        '.manifesto-card, .module, .feature, .chapter-item'
    );
    
    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                elementObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        elementObserver.observe(el);
    });
    
    // ============================================
    // Chapter reading progress (if on chapter page)
    // ============================================
    const progressBar = document.querySelector('.reading-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = progress + '%';
        });
    }
    
    // ============================================
    // AI TA demo functionality (if on AI TA page)
    // ============================================
    const aiDemo = document.querySelector('.ai-ta-demo');
    if (aiDemo) {
        const demoButton = aiDemo.querySelector('.demo-button');
        const demoOutput = aiDemo.querySelector('.demo-output');
        
        if (demoButton && demoOutput) {
            demoButton.addEventListener('click', async () => {
                demoOutput.textContent = 'Thinking...';
                demoOutput.classList.add('loading');
                
                // Simulate AI response (in production, this would call the local API)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                demoOutput.textContent = `AI TA: That's an interesting question! Let's think about this step by step. What do you think are the pre-conditions for this function? Consider what must be true before it can work correctly.`;
                demoOutput.classList.remove('loading');
            });
        }
    }
    
    // ============================================
    // Mobile menu toggle
    // ============================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // ============================================
    // Copy code blocks
    // ============================================
    document.querySelectorAll('pre code').forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => button.textContent = 'Copy', 2000);
            });
        });
        block.parentNode.style.position = 'relative';
        block.parentNode.appendChild(button);
    });
    
    // ============================================
    // Console welcome message
    // ============================================
    console.log('%c Formal Methods + AI ', 
        'background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;'
    );
    console.log('%c Welcome to the course website! ', 
        'color: #64748b; font-size: 14px;'
    );
    console.log('%c Open source • CC BY-SA 4.0 • Zero-cost AI tools ', 
        'color: #10b981; font-size: 12px;'
    );
    
});

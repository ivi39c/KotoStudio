/* KOTO Studio - 輕量化互動規範 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 原生滾動觀察 (Intersection Observer) - 實現優雅淡入
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));

    // 2. 合作流程：極細灰線隨滾動延伸
    window.addEventListener('scroll', () => {
        const line = document.querySelector('.process-line');
        if(line) {
            const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            line.style.height = (scrollPercent * 100) + 'vh';
        }
    });

    // 3. Footer 彩蛋：游標軌跡
    document.querySelector('.easter-egg')?.addEventListener('click', (e) => {
        console.log('KOTO 職人彩蛋已觸發');
        // 可在此處加入擴充動畫邏輯
    });
});

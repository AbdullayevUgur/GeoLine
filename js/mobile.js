// ===== MOBILE INTERACTIONS =====
document.addEventListener('DOMContentLoaded', function() {
    // 1. Бургер-меню
    const initMobileMenu = () => {
        const burger = document.querySelector('.burger');
        const navLinks = document.querySelector('.nav-links');
        const navItems = document.querySelectorAll('.nav-links a');

        if (!burger || !navLinks) return;

        // Анимация бургера и меню
        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            burger.classList.toggle('open');
            navLinks.classList.toggle('active');

            // Блокировка скролла при открытом меню
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Закрытие при клике на ссылку
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                burger.classList.remove('open');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target)) {
                burger.classList.remove('open');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    };

    // 2. Плавный скролл для якорных ссылок
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 60, // Учитываем высоту шапки
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // 3. Интерактивные карточки услуг
    const initServiceCards = () => {
        const cards = document.querySelectorAll('.service-card');

        cards.forEach(card => {
            // Эффект при нажатии
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            });

            card.addEventListener('touchend', () => {
                card.style.transform = '';
            });
        });
    };

    // 4. Оптимизация формы
    const initForm = () => {
        const form = document.querySelector('.contact-form form');
        if (!form) return;

        // Валидация телефона
        const phoneInput = form.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d+]/g, '');
            });
        }

        // Отправка формы
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');

            // Имитация отправки
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = 'Отправлено!';
                this.reset();

                // Возвращаем исходное состояние
                setTimeout(() => {
                    submitBtn.textContent = 'Отправить';
                    submitBtn.disabled = false;
                }, 2000);
            }, 1500);
        });
    };

    // 5. Оптимизация для touch-устройств
    const initTouchOptimization = () => {
        // Увеличиваем зону клика
        document.querySelectorAll('button, a, input[type="submit"]').forEach(el => {
            el.style.minHeight = '44px';
            el.style.minWidth = '44px';
        });
    };

    // Инициализация всех функций
    initMobileMenu();
    initSmoothScroll();
    initServiceCards();
    initForm();
    initTouchOptimization();

    // 6. Ленивая загрузка изображений (если нужно)
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
});
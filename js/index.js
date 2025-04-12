// Добавляем обработчик событий для всех кнопок с классом .toggle-btn
document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Находим следующий элемент (контент карточки)
        const content = this.parentElement.nextElementSibling;

        // Переключаем классы для кнопки и контента
        this.classList.toggle('rotate');
        content.classList.toggle('open');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Собираем данные формы
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Отправляем на Google Apps Script
            const response = await fetch('https://script.google.com/macros/s/AKfycbxfPN8Fq2vj4_ZkMAXANBBmnyRflXhSkKDxptoNaHZe0utkbc0nOP5mXO9CMhv6Aljr/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                alert('Сообщение отправлено!');
                form.reset(); // Очищаем форму
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const faqSection = document.getElementById('faq');
    const faqItems = faqSection.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');
        const answer = item.querySelector('.faq-answer');

        // Обработчик клика на вопрос
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Закрываем все открытые элементы
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-toggle').setAttribute('aria-expanded', 'false');
                }
            });

            // Переключаем текущий элемент
            if (!isActive) {
                item.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
            } else {
                item.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Обработчик для кнопки (предотвращаем всплытие события)
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            question.click();
        });
    });
});
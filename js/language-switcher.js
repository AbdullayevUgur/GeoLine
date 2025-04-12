class LanguageSwitcher {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.setupEventListeners();
        this.applyTranslations(this.currentLang);
    }

    async loadTranslations() {
        try {
            const response = await fetch('translations/translations.json');
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    applyTranslations(lang) {
        // Переводим элементы с data-translate
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (this.translations[lang]?.[key]) {
                el.textContent = this.translations[lang][key];
            }
        });

        // Переводим атрибуты (placeholder, title и т.д.)
        document.querySelectorAll('[data-translate-attr]').forEach(el => {
            const [attr, key] = el.getAttribute('data-translate-attr').split(':');
            if (this.translations[lang]?.[key]) {
                el.setAttribute(attr, this.translations[lang][key]);
            }
        });

        // Обновляем кнопку переключателя
        const currentLangBtn = document.querySelector('.language-current span');
        if (currentLangBtn) {
            currentLangBtn.textContent = lang.toUpperCase();
        }

        this.currentLang = lang;
        localStorage.setItem('language', lang);

        // Добавляем класс к body для языковых стилей
        document.body.classList.remove('lang-en', 'lang-ru', 'lang-az');
        document.body.classList.add(`lang-${lang}`);
    }

    setupEventListeners() {
        const languageSwitcher = document.querySelector('.language-switcher');
        const languageCurrent = document.querySelector('.language-current');
        const languageOptions = document.querySelectorAll('.language-option');

        if (languageCurrent) {
            languageCurrent.addEventListener('click', (e) => {
                e.stopPropagation();
                languageSwitcher.classList.toggle('active');
            });
        }

        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                this.applyTranslations(lang);
                languageSwitcher.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!languageSwitcher?.contains(e.target)) {
                languageSwitcher?.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                languageSwitcher?.classList.remove('active');
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new LanguageSwitcher();
});
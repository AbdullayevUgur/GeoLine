document.addEventListener("DOMContentLoaded", function () {
    const burger = document.getElementById("burger");
    const mobileMenu = document.getElementById("mobileMenu");
    const languageCurrent = document.querySelector(".language-current");
    const languageDropdown = document.querySelector(".language-dropdown");

    // Открытие/закрытие бургер-меню
    burger.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
        burger.classList.toggle("open");

        // Закрыть языковой переключатель при открытии меню
        languageDropdown.classList.remove("open");
        languageCurrent.setAttribute("aria-expanded", "false");
    });

    // Языковой переключатель
    languageCurrent.addEventListener("click", function (e) {
        e.stopPropagation();
        const expanded = languageCurrent.getAttribute("aria-expanded") === "true";
        languageCurrent.setAttribute("aria-expanded", String(!expanded));
        languageDropdown.classList.toggle("open");
    });

    // Клик вне меню/языка — закрытие
    document.addEventListener("click", function (e) {
        if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) {
            mobileMenu.classList.remove("open");
            burger.classList.remove("open");
        }

        if (!languageCurrent.contains(e.target)) {
            languageDropdown.classList.remove("open");
            languageCurrent.setAttribute("aria-expanded", "false");
        }
    });

    // FAQ раскрытие
    document.querySelectorAll(".faq-question").forEach((question) => {
        question.addEventListener("click", () => {
            const item = question.closest(".faq-item");
            item.classList.toggle("open");
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const burger = document.getElementById("burger");
    const mobileMenu = document.getElementById("mobileMenu");
    const languageToggle = document.getElementById("languageToggle");
    const languageDropdown = document.getElementById("languageDropdown");

    // Переключение бургер-меню
    burger.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
        burger.classList.toggle("open");
    });

    // Переключение раскрывающегося списка языков
    languageToggle.addEventListener("click", () => {
        const expanded = languageToggle.getAttribute("aria-expanded") === "true";
        languageToggle.setAttribute("aria-expanded", String(!expanded));
        languageDropdown.classList.toggle("open");
    });

    // Закрыть язык при клике вне
    document.addEventListener("click", (e) => {
        if (!languageToggle.contains(e.target) && !languageDropdown.contains(e.target)) {
            languageDropdown.classList.remove("open");
            languageToggle.setAttribute("aria-expanded", "false");
        }
    });
});

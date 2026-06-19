(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let heroIndex = 0;

    function showHero(index) {
        if (!heroSlides.length) {
            return;
        }
        heroIndex = (index + heroSlides.length) % heroSlides.length;
        heroSlides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === heroIndex);
        });
        heroDots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === heroIndex);
        });
    }

    heroDots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });

    if (heroSlides.length > 1) {
        setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const filterYear = document.querySelector("[data-filter-year]");
    const filterType = document.querySelector("[data-filter-type]");
    const filterReset = document.querySelector("[data-filter-reset]");
    const cards = Array.from(document.querySelectorAll(".movie-card"));

    function normalized(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        const query = normalized(filterInput ? filterInput.value : "");
        const year = normalized(filterYear ? filterYear.value : "");
        const type = normalized(filterType ? filterType.value : "");

        cards.forEach(function (card) {
            const haystack = normalized([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
            const cardYear = normalized(card.getAttribute("data-year"));
            const cardType = normalized(card.getAttribute("data-type"));
            const matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
            card.classList.toggle("is-hidden-by-filter", !matched);
        });
    }

    if (filterInput || filterYear || filterType) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q && filterInput) {
            filterInput.value = q;
        }
        [filterInput, filterYear, filterType].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
        if (filterReset) {
            filterReset.addEventListener("click", function () {
                if (filterInput) {
                    filterInput.value = "";
                }
                if (filterYear) {
                    filterYear.value = "";
                }
                if (filterType) {
                    filterType.value = "";
                }
                applyFilters();
            });
        }
        applyFilters();
    }
})();

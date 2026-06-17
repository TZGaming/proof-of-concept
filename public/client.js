let photoSelector = document.querySelector('.photo-selector');

photoSelector.hidden = false;

document.addEventListener('DOMContentLoaded', function () {
    // Pak de foto-carrousel en alle slides en thumbnails
    const mainTrack = document.querySelector('.photo-main-track');
    const slideButtons = Array.from(document.querySelectorAll('.photo-main-slide'));
    const thumbnails = Array.from(document.querySelectorAll('.photo-selector .thumbnail-button'));
    let currentIndex = 0;
    let isScrolling;

    // Maak de juiste thumbnail en slide actief
    function updateActive(index) {
        thumbnails.forEach(function (btn, btnIndex) {
            btn.classList.toggle('selected', btnIndex === index);
            if (btnIndex === index) {
                btn.setAttribute('aria-current', 'true');
                // Scroll de geselecteerde thumbnail in beeld
                btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } else {
                btn.removeAttribute('aria-current');
            }
        });

        slideButtons.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === index);
        });

        currentIndex = index;
    }

    // Kies een foto op basis van index en scroll de grote afbeelding als dat mag
    function selectImage(index, scrollTrack) {
        if (index < 0) {
            index = slideButtons.length - 1;
        } else if (index >= slideButtons.length) {
            index = 0;
        }

        if (currentIndex === index) {
            // Zelfde foto al actief, niks doen
            return;
        }

        updateActive(index);
        if (scrollTrack !== false) {
            slideButtons[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }
    }

    // Kijk welke slide het dichtst bij de linkerkant staat
    function findClosestSlide() {
        const trackRect = mainTrack.getBoundingClientRect();
        let closestIndex = 0;
        let closestDistance = Infinity;

        slideButtons.forEach(function (slide, index) {
            const rect = slide.getBoundingClientRect();
            const distance = Math.abs(rect.left - trackRect.left);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    // Klik of druk op een thumbnail om die foto te kiezen
    thumbnails.forEach(function (button, index) {
        button.addEventListener('click', function () {
            selectImage(index);
        });
        button.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectImage(index);
            }
        });
    });

    // Als je de grote foto-slider scrollt, kies de dichtstbijzijnde foto
    mainTrack.addEventListener('scroll', function () {
        window.clearTimeout(isScrolling);
        isScrolling = window.setTimeout(function () {
            const nearest = findClosestSlide();
            selectImage(nearest, false);
        }, 80);
    }, { passive: true });
});

let reviewButton = document.querySelector('.add-review-button');
let reviewSection = document.querySelector('.add-review-section');
let submitButton = document.querySelector('.submit-review-button');
let reviewForm = document.querySelector('.add-review-section');

reviewSection.classList.add('hidden');

reviewButton.addEventListener('click', () => {
    reviewSection.classList.toggle('hidden');
});

reviewForm.addEventListener('submit', () => {
    submitButton.classList.add('loading');
    submitButton.disabled = true;
});
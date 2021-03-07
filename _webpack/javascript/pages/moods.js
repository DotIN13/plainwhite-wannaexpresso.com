import { responsiveGenerator, importAll } from '../responsive-img'

const imagesAvif = importAll(require.context('/assets/img/in-mood?format=avif', true, /\.(jpe?g|png|webp|webp)$/i))
const imagesWebp = importAll(require.context('/assets/img/in-mood?format=webp', true, /\.(jpe?g|png|webp|webp)$/i))
const imageSizes = "(max-width: 1024px) 280px, (max-width: 1600px) 484px, 484px"


const moods = {
    get focus() {
        let focus = document.querySelector(".mood.focus")
        return focus ? focus : document.querySelector(".mood")
    },
    get all() {
        return document.querySelectorAll(".mood")
    },
    get count() {
        return this.all.length
    },
    get buttonPrev() {
        return document.querySelector(".mood-button--prev")
    },
    get buttonNext() {
        return document.querySelector(".mood-button--next")
    },
    get track() {
        return document.querySelector(".mood-track")
    },
    get index() {
        return parseInt(this.track.dataset.moodFocus)
    },
    set index(val) {
        // Set moods index
        this.track.dataset.moodFocus = val
        // Set focus class
        this.all.forEach((el, i) => {
            el.classList.toggle("focus", i == val)
            // ScrollIntoView
            if (i == val) {
                el.scrollIntoView({
                    block: "nearest",
                    inline: "center",
                    behavior: "smooth"
                })
            }
        })
    }
}

/** Mood navigator */
// Moods index range (0..moods.count - 1)
function nextMood() {
    let max = moods.count - 1
    moods.index = moods.index + 1 <= max ? moods.index + 1 : max
}

function prevMood() {
    moods.index = (moods.index - 1) >= 0 ? moods.index - 1 : 0
}

function scrollControl() {
    moods.buttonPrev.classList.toggle("hide", !moods.track.scrollLeft)
    moods.buttonNext.classList.toggle("hide", moods.track.scrollLeft >= (moods.track.scrollWidth - moods.track.offsetWidth) * .8)
}

/** Mood images */
function renderMoodImages() {
    document.querySelectorAll('.mood-header-image').forEach((el) => {
        responsiveGenerator(el, [imagesAvif[el.dataset.path], imagesWebp[el.dataset.path]], imageSizes)
    })
}

/** Global functions */
function bindMoodUtilities() {
    if (document.querySelector(".mood")) {
        renderMoodImages()
        moods.buttonPrev.addEventListener("click", prevMood)
        moods.buttonNext.addEventListener("click", nextMood)
        moods.track.addEventListener("scroll", scrollControl)
    }
}

window.addEventListener("DOMContentLoaded", bindMoodUtilities)


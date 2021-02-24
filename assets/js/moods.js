(function () {
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
            return document.querySelector(".moods")
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
        moods.buttonNext.classList.toggle("hide", moods.track.scrollLeft >= (moods.track.scrollWidth - moods.track.offsetWidth) * .8 )
    }

    function bindMoodUtilities() {
        if (document.getElementById("moods-container")) {
            moods.buttonPrev.addEventListener("click", prevMood)
            moods.buttonNext.addEventListener("click", nextMood)
            moods.track.addEventListener("scroll", scrollControl)
        }
    }


    window.addEventListener("DOMContentLoaded", bindMoodUtilities)
})()
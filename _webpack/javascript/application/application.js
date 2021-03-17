/* Modules */
import "@fancyapps/fancybox"
import { responsiveGenerator } from '../responsive-img'
import avatarAvif from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=avif'
import avatarWebp from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=webp'
const avatarSizes = "(max-width: 600px) 105px, (max-width: 1024px) 150px, (max-width: 1600px) 240px, 240px"

let removeActive = (e) => e.target.classList.remove("active")
let addActive = (e) => e.target.classList.add("active")
let animateHeart = (e) => {
    e.stopPropagation()
    // Animate heart after clicking
    e.target.classList.add("heart--animating")
    // Try to like article
    like(e.target)
}

function bindHeartActions(heart) {
    heart.addEventListener("click", animateHeart)
    heart.addEventListener("animationend", (e) => e.target.classList.remove("heart--animating"))
    heart.addEventListener("mouseover", addActive)
    heart.addEventListener("mouseleave", removeActive)
}

function like(heart) {
    fetch(`/api/like?article_id=${heart.dataset.like}`).then((res) => {
        if (res.ok) {
            heart.classList.add("active")
            heart.removeEventListener("mouseover", addActive)
            heart.removeEventListener("mouseleave", removeActive)
            heart.removeEventListener("click", animateHeart)
        }
    })
}

window.addEventListener('DOMContentLoaded', () => {
    /** Initialize fancybox */
    $('[data-fancybox="gallery"]').fancybox({
        buttons: [
            'download',
            'thumbs',
            'close'
        ]
    });

    /** Render avatar image */
    responsiveGenerator(document.getElementById('avatar'), [avatarAvif, avatarWebp], avatarSizes, false, {
        width: 150,
        height: 150
    })

    /** Heart-shaped like button animations */
    document.querySelectorAll('.heart').forEach((el) => bindHeartActions(el))
})

/* CSS */
import '../../stylesheets/custom.scss'
import '@fancyapps/fancybox/dist/jquery.fancybox.css'
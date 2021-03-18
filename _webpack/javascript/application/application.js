/* Modules */
import "@fancyapps/fancybox"
import { responsiveGenerator } from '../responsive-img'
import avatarAvif from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=avif'
import avatarWebp from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=webp'
const avatarSizes = "(max-width: 600px) 105px, (max-width: 1024px) 150px, (max-width: 1600px) 240px, 240px"
import { likes } from '../likes'

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
    likes.bindHeartActions()
    likes.fetch()
})

/* CSS */
import '../../stylesheets/custom.scss'
import '@fancyapps/fancybox/dist/jquery.fancybox.css'
/* Modules */
import "@fancyapps/fancybox"
import responsiveGenerator from '../responsive-img'
import avatar from '/assets/img/orange.webp?sizes[]=70,sizes[]=120,sizes[]=150,sizes[]=320&format=png'
import avatarWebp from '/assets/img/orange.webp?sizes[]=70,sizes[]=120,sizes[]=150,sizes[]=320&format=webp'

window.addEventListener('DOMContentLoaded', () => {
    $('[data-fancybox="gallery"]').fancybox({
        buttons: [
            'download',
            'thumbs',
            'close'
        ]
    });

    responsiveGenerator(document.getElementById('avatar'), avatar, avatarWebp, true)
})

/* CSS */
import '../../stylesheets/custom.scss';
import '@fancyapps/fancybox/dist/jquery.fancybox.css'
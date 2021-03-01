/* Modules */
import "@fancyapps/fancybox"

window.addEventListener('DOMContentLoaded', () => {
    $('[data-fancybox="gallery"]').fancybox({
        buttons: [
            'download',
            'thumbs',
            'close'
        ]
    });
})

/* CSS */
import '../../stylesheets/custom.scss';
import '@fancyapps/fancybox/dist/jquery.fancybox.css'
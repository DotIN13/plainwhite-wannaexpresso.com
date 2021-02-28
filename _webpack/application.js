/* Modules */
import Valine from 'valine'
import SimpleJekyllSearch from 'simple-jekyll-search'
import "@fancyapps/fancybox"

window.addEventListener('DOMContentLoaded', () => {
    /* Valine */
    new Valine({
        el: '#vcomments',
        appId: 'PSy1tmiW2mx0DpKo7psk67EN-9Nh9j0Va',
        appKey: 'MskLH2QYVC2Kqj8aG3XJ7x7o',
        placeholder: 'Your comment here...',
        avatar: 'identicon',
        visitor: true,
        lang: 'en'
    })
    if (document.getElementById('vcomments')) {
        document.querySelector(".vicon.vemoji-btn").innerHTML = '';
        document.querySelector(".vicon.vpreview-btn").innerHTML = '';
    }

    $('[data-fancybox="gallery"]').fancybox({
        buttons: [
            'download',
            'thumbs',
            'close'
        ]
    });

    $('a[href^="http"]').each(function () {
        $(this).attr('target', '_blank');
    });
})

/* CSS */
import './stylesheets/custom.scss';
import '@fancyapps/fancybox/dist/jquery.fancybox.css'
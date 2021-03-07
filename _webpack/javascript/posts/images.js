import { responsiveGenerator, importAll } from '../responsive-img'

const imagesAvif = importAll(require.context('/assets/img/in-post?format=avif', true, /\.(jpe?g|png|webp|webp)$/i))
const imagesWebp = importAll(require.context('/assets/img/in-post?format=webp', true, /\.(jpe?g|png|webp|webp)$/i))

window.addEventListener('DOMContentLoaded', () => {
    const imageSizes = "(max-width: 600px) 80vw, (max-width: 1024px) 60vw, (max-width: 1600px) 800px, 100vw"
    document.querySelectorAll('.post a[data-webpack="true"]').forEach((el, index) => {
        let avifObj = imagesAvif[el.dataset.path]
        let webpObj = imagesWebp[el.dataset.path]
        //console.log(el.dataset, images)
        responsiveGenerator(el, [avifObj, webpObj], imageSizes, index > 0)
    })
})
import responsiveGenerator from '../responsive-img'

function importAll(r) {
    let images = {}
    r.keys().map(x => images[x.replace(/^\.\//, '')] = r(x))
    return images
}

const images = importAll(require.context('/assets/img/in-post', true, /\.(jpe?g|png|webp|webp)$/i))
const imagesWebp = importAll(require.context('/assets/img/in-post?format=webp', true, /\.(jpe?g|png|webp|webp)$/i))

window.addEventListener('DOMContentLoaded', () =>{
    document.querySelectorAll('.post a[data-webpack="true"]').forEach(el => {
        let commonObj = images[el.dataset.path]
        let webpObj = imagesWebp[el.dataset.path]
        //console.log(el.dataset, images)
        responsiveGenerator(el, commonObj, webpObj)
    })
})
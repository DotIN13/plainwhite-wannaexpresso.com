export default function (el, commonObj, webpObj, omitWidth = false) {
    let pic = document.createElement('picture')
    let img = document.createElement('img')
    
    img.srcset = commonObj.srcSet
    img.src = commonObj.src
    img.sizes = "(max-width: 600px) 80vw, (max-width: 900px) 60vw, (max-width: 1800px) 800px, 100vw"
    img.loading = 'lazy'
    if (!omitWidth) {
        img.width = commonObj.width * 1.5
        img.height = commonObj.height * 1.5
    }
    img.alt = el.dataset.caption
    
    let webp = document.createElement('source')
    webp.srcset = webpObj.srcSet
    webp.type = 'image/webp'
    
    pic.appendChild(webp)
    pic.appendChild(img)
    el.appendChild(pic)
}

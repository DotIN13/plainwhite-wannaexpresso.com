export default function (el, imgObjs = [], sizes, lazy = true, dim = {
    original: true
}) {
    const pic = document.createElement('picture')
    const img = document.createElement('img')

    img.alt = el.dataset.caption
    const srcObj = imgObjs[imgObjs.length - 1]
    img.src = srcObj.src
    img.loading = lazy ? 'lazy' : 'auto'
    if (dim["original"]) {
        img.width = srcObj.width
        img.height = srcObj.height
    } else {
        img.width = dim["width"]
        img.height = dim["height"]
    }

    imgObjs.forEach((obj) => {
        const source = document.createElement("source")
        source.srcset = obj.srcSet
        source.sizes = sizes
        source.type = "image/" + obj.src.split(".").pop()
        pic.appendChild(source)
    })

    pic.appendChild(img)
    el.appendChild(pic)
}
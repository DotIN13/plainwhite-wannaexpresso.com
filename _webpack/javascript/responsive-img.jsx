import Zoom from 'react-medium-image-zoom';
import { h } from 'preact';
import 'react-medium-image-zoom/dist/styles.css';

Array.prototype.last = function () { return this[this.length - 1]; };

const Source = (props) => <source
  srcset={props.images.srcSet}
  sizes={props.sizes}
  type={`image/${props.images.src.split('.').pop()}`}
/>;

const Img = (props) => <img
  src={props.image.path}
  loading={props.lazy ? 'lazy' : 'eager'}
  width={props.image.width}
  height={props.image.height}
/>;

export const Picture = (props) => {
  return <picture>
    <Source images={props.avif} sizes={props.sizes} />
    <Source images={props.webp} sizes={props.sizes} />
    <Img image={props.webp.images.last()} lazy={props.lazy} />
  </picture>;
};

export const ZoomableImage = (props) => {
  return <Zoom>
    <Picture avif={props.avif} webp={props.webp} sizes={props.sizes} style={props.style} lazy={props.lazy} />
  </Zoom>;
};

// export function responsiveGenerator(el, imgObjs, sizes, lazy = true, dim = { original: true }) {
//   if (!el) return;

//   const pic = document.createElement('picture');
//   const img = document.createElement('img');

//   img.alt = el.dataset.caption;
//   let srcObj = imgObjs[imgObjs.length - 1];
//   srcObj = srcObj.images[srcObj.images.length - 1];
//   img.src = srcObj.path;
//   img.loading = lazy ? 'lazy' : 'eager';
//   if (dim["original"]) {
//     img.width = srcObj.width;
//     img.height = srcObj.height;
//   }
//   else {
//     img.width = dim["width"];
//     img.height = dim["height"];
//   }

//   imgObjs.forEach((obj) => {
//     const source = document.createElement("source");
//     source.srcset = obj.srcSet;
//     source.sizes = sizes;
//     source.type = `image/${obj.src.split(".").pop()}`;
//     pic.appendChild(source);
//   });

//   pic.appendChild(img);
//   el.appendChild(pic);
//   return img;
// }

export function importAll(r) {
  let images = {};
  r.keys().map(imgPath => images[imgPath.replace(/^\.\//, '')] = r(imgPath));
  return images;
}
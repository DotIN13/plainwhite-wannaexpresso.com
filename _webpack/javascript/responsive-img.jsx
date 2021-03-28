import { h } from 'preact';

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
  class={props.class}
/>;

export const Picture = (props) => {
  return <picture>
    <Source images={props.avif} sizes={props.sizes} />
    <Source images={props.webp} sizes={props.sizes} />
    <Img image={props.webp.images.last()} lazy={props.lazy} class={props.class} />
  </picture>;
};

export function importAll(r) {
  let images = {};
  r.keys().map(imgPath => images[imgPath.replace(/^\.\//, '')] = r(imgPath));
  return images;
}
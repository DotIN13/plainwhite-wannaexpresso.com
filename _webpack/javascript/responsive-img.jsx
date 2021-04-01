import { h } from 'preact';

Array.prototype.last = function () { return this[this.length - 1]; };

const Source = (props) => <source
  srcset={props.images.srcSet}
  sizes={props.sizes}
  type={`image/${props.images.src.split('.').pop()}`}
/>;

const Img = (props) => {
  const image = props.webp.images.last();
  return <img
    src={image.path}
    loading={props.lazy ? 'lazy' : 'eager'}
    width={process.env.NODE_ENV === "production" ? image.width : 0}
    height={process.env.NODE_ENV === "production" ? image.height : 0}
    class={props.class}
    data-portal-target={props.imagePortalTarget}
  />;
};

export const Picture = (props) => {
  return <picture data-portal-target={props.picturePortalTarget}>
    <Source images={props.avif} sizes={props.sizes} />
    <Source images={props.webp} sizes={props.sizes} />
    <Img {...props} />
  </picture>;
};

export function importAll(r) {
  let images = {};
  r.keys().map(imgPath => images[imgPath.replace(/^\.\//, '')] = r(imgPath));
  return images;
}
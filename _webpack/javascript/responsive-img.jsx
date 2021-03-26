// import "preact/debug";
import { h } from 'preact';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
// import {useState, useCallback} from 'preact/hooks';
// import { Controlled as ControlledZoom } from 'react-medium-image-zoom';

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

// const useToggler = () => {
//   const [isZoomed, setIsZoomed] = useState(false);

//   const toggleZoom = useCallback(e => {
//     e.stopPropagation();
//     setIsZoomed(!isZoomed);
//   }, [isZoomed]);

//   const handleZoomChange = useCallback(shouldZoom => {
//     setIsZoomed(shouldZoom);
//   }, []);

//   return { isZoomed, handleZoomWrapper, handleZoomChange };
// };

export const ZoomableImage = (props) => {
  // const { isZoomed, handleZoomWrapper, handleZoomChange } = useToggler();

  const handleZoomWrapper = e => e.stopPropagation();

  return <div class="react-zoom-wrapper" onClick={handleZoomWrapper}>
    {/* <ControlledZoom isZoomed={isZoomed} onZoomChange={handleZoomChange}>
      <Picture {...props} />
    </ControlledZoom> */}
    <Zoom>
      <Picture {...props} />
    </Zoom>
  </div>;
};

export function importAll(r) {
  let images = {};
  r.keys().map(imgPath => images[imgPath.replace(/^\.\//, '')] = r(imgPath));
  return images;
}
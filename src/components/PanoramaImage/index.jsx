import React, { useEffect } from 'react';

const PanoramaImage = (props) => {
  useEffect(() => {
    window.pannellum.viewer('panorama', {
      type: 'equirectangular',
      panorama: props.url,
      autoLoad: true,
    });
  }, []);
  return <div id="panorama"></div>;
};

export default PanoramaImage;
import { useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

const BAD_SRCS = {};

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, style, className, ...rest }) {
  const [, refresh] = useState(0);

  const src = srcs.find((src) => !BAD_SRCS[src]);

  if (src) {
    return (
      <img
        {...rest}
        alt={alt}
        src={src}
        style={style}
        onError={() => {
          if (src) BAD_SRCS[src] = true;
          refresh((i) => i + 1);
        }}
        className='currency-logo'
        height={24}
        width={'auto'}
        className={className}
      />
    );
  }

  return <AiOutlineQuestionCircle className={`icons ${className}`} />;
}

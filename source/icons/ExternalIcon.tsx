import * as React from 'react';
import {forwardRef} from 'react';

export default forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
  function ExternalIcon(props, ref) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
        ref={ref}
      >
        <path fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M11.099 3c-3.65.007-5.56.096-6.781 1.318C3 5.636 3 7.757 3 12c0 4.242 0 6.364 1.318 7.682S7.757 21 11.998 21c4.243 0 6.364 0 7.682-1.318c1.22-1.221 1.31-3.133 1.317-6.782m-.441-9.404L11.05 13.06m9.507-9.563c-.494-.494-3.822-.448-4.525-.438m4.525.438c.494.495.448 3.827.438 4.531"
        />
      </svg>
    );
  }
);

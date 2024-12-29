import * as React from 'react';
import {forwardRef} from 'react';

export default forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
  function FailedIcon(props, ref) {
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
          d="m15.75 15l-6-6m0 6l6-6m7 3c0-5.523-4.477-10-10-10s-10 4.477-10 10s4.477 10 10 10s10-4.477 10-10"
        />
      </svg>
    );
  }
);

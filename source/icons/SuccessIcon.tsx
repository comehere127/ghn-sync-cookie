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
        <g fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        >
          <path d="M17 3.338A9.95 9.95 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10q-.002-1.03-.2-2" />
          <path d="M8 12.5s1.5 0 3.5 3.5c0 0 5.559-9.167 10.5-11" />
        </g>
      </svg>
    );
  }
);


import React from 'react';

const ClipboardIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.159.084.326.084.5v1.875a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 8.25V6.375c0-.174.03-.341.084-.5M15.666 3.888a2.25 2.25 0 0 0-2.166-1.638M12 18a3.75 3.75 0 0 0 .495-7.467 3.75 3.75 0 0 0-7.99 0 3.75 3.75 0 0 0 .495 7.467M12 18a3.75 3.75 0 0 0 3.75-3.75v-1.5c0-2.071-1.679-3.75-3.75-3.75S8.25 9.179 8.25 11.25v1.5A3.75 3.75 0 0 0 12 18Z"
    />
  </svg>
);

export default ClipboardIcon;

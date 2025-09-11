
import React from 'react';

const MosqueIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 1L3 5v1.5L6 5v6H4v2h2v7h2v-7h8v7h2v-7h2v-2h-2V5l3 1.5V5L12 1zm-4 5h8v6H8V6z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
);

export default MosqueIcon;

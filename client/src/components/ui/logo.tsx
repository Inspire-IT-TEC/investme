interface LogoProps {
  className?: string;
}

export function InvestmeLogo({ className = "h-8" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <rect width="40" height="40" rx="8" fill="url(#gradient)" />
        <path
          d="M12 16L20 12L28 16V28C28 29.1046 27.1046 30 26 30H14C12.8954 30 12 29.1046 12 28V16Z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M16 26V20"
          stroke="url(#gradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M20 26V18"
          stroke="url(#gradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 26V22"
          stroke="url(#gradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="gradient"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#667eea" />
            <stop offset="1" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-2xl font-bold text-gray-900">InvestMe</span>
    </div>
  );
}
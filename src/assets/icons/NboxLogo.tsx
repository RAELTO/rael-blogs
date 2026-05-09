import type { SVGProps } from 'react'

export default function NboxLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <text
        x="16"
        y="23"
        fontFamily="'Archivo Black', 'Arial Black', sans-serif"
        fontSize="17"
        fontWeight="900"
        fill="currentColor"
        textAnchor="middle"
      >
        NB
      </text>
    </svg>
  )
}

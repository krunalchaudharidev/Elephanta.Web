import React from 'react'

export default function ToggleSwitch({ checked = false, onChange = () => {}, disabled = false, size = 'md', className = '' }) {
  const sizes = {
    sm: { w: 'w-10', h: 'h-6', knob: 'w-4 h-4 translate-x-0.5 translate-y-0.5', knobTranslate: 'translate-x-4' },
    md: { w: 'w-12', h: 'h-7', knob: 'w-6 h-6 translate-x-0.5 translate-y-0.5', knobTranslate: 'translate-x-5' },
    lg: { w: 'w-14', h: 'h-8', knob: 'w-7 h-7 translate-x-0.5 translate-y-0.5', knobTranslate: 'translate-x-6' },
  }
  const s = sizes[size] || sizes.md

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => { if (!disabled) onChange(!checked, e) }}
      className={`relative inline-flex items-center ${s.w} ${s.h} rounded-full transition-colors duration-150 focus:outline-none ${checked ? 'bg-blue-500' : 'bg-gray-300'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 ${s.knob} bg-white rounded-full shadow transform transition-transform duration-150 ${checked ? s.knobTranslate : ''}`}
      />
    </button>
  )
}

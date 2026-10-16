export const inputClass = 'w-full rounded-md border border-[#DEDCD6] bg-white px-3.5 py-3 text-sm text-[#183129] outline-none transition placeholder:text-[#A0A49F] focus:border-[#A77B4C] focus:ring-2 focus:ring-[#A77B4C]/10'
export const labelClass = 'mb-2 block text-xs font-medium text-[#34423B]'

export default function ProfileField({ label, htmlFor, required, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
export default function Loader({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <div className={`${sizeClass} animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600`} />
    </div>
  )
}

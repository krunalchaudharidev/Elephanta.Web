import { Link } from 'react-router-dom'

export default function PageHeader({ title, right }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-start gap-4">
        <div>
          <div className="text-sm text-gray-500 mt-2">
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:underline">
              <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Dashboard</span>
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span>{title}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        {right}
      </div>
    </div>
  )
}

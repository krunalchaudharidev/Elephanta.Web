import { Link } from 'react-router-dom'

export default function PageHeader({ title, right, breadcrumbs }) {
  const hasCrumbs = Array.isArray(breadcrumbs) && breadcrumbs.length > 0

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-start gap-4">
        <div>
          <div className="text-sm text-gray-500 mt-2">
            {hasCrumbs ? (
              <>
                {breadcrumbs.map((c, i) => (
                  <span key={i} className="inline-flex items-center">
                    {c.to ? (
                      <Link to={c.to} className="inline-flex items-center gap-2 text-indigo-600 hover:underline">{c.label}</Link>
                    ) : (
                      <span>{c.label}</span>
                    )}
                    {i < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400">/</span>}
                  </span>
                ))}
              </>
            ) : (
              <span>{title}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        {right}
      </div>
    </div>
  )
}

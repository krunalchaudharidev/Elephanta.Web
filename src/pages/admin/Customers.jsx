import { useEffect, useState } from 'react'
import PageHeader from '../../components/admin/shared/PageHeader'
import { getUsers } from '../../services/userapi'

const initialFilters = {
  name: '',
  email: '',
  phoneNumber: '',
  sortOrder: 'asc',
}

function getUserName(user) {
  return [
    user.firstName ?? user.FirstName,
    user.middleName ?? user.MiddleName,
    user.lastName ?? user.LastName,
  ].filter(Boolean).join(' ') || '-'
}

function formatDateOfBirth(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export default function AdminCustomers() {
  const [users, setUsers] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      setLoading(true)
      setError('')
      try {
        const response = await getUsers({
          pageNumber,
          pageSize,
          ...appliedFilters,
        })
        const items = response?.items ?? response?.Items
        const count = response?.totalCount ?? response?.TotalCount
        if (!Array.isArray(items) || !Number.isFinite(Number(count))) {
          throw new Error('Users response is invalid.')
        }
        if (cancelled) return
        setUsers(items)
        setTotalCount(Number(count))
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.message || 'Unable to load customers.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUsers()
    return () => {
      cancelled = true
    }
  }, [pageNumber, pageSize, appliedFilters])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleSearch(event) {
    event.preventDefault()
    setPageNumber(1)
    setAppliedFilters({ ...filters })
  }

  function handleReset() {
    const resetFilters = { ...initialFilters }
    setFilters(resetFilters)
    setAppliedFilters(resetFilters)
    setPageNumber(1)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const firstPage = Math.max(1, Math.min(pageNumber - 2, totalPages - 4))
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => firstPage + index
  )

  return (
    <div className="w-full">
      <PageHeader
        title="Customers"
        breadcrumbs={[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'Customers' },
        ]}
      />

      <div className="mb-6">
        <p className="text-sm text-gray-500">Manage customer accounts</p>
      </div>

      <form onSubmit={handleSearch} className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="name"
          type="search"
          placeholder="Search by name"
          value={filters.name}
          onChange={updateFilter}
          className="w-full rounded border px-3 py-2 text-sm"
          aria-label="Search by name"
        />
        <input
          name="email"
          type="email"
          placeholder="Search by email"
          value={filters.email}
          onChange={updateFilter}
          className="w-full rounded border px-3 py-2 text-sm"
          aria-label="Search by email"
        />
        <input
          name="phoneNumber"
          type="search"
          placeholder="Search by phone number"
          value={filters.phoneNumber}
          onChange={updateFilter}
          className="w-full rounded border px-3 py-2 text-sm"
          aria-label="Search by phone number"
        />
        <select
          name="sortOrder"
          value={filters.sortOrder}
          onChange={updateFilter}
          className="w-full rounded border px-3 py-2 text-sm"
          aria-label="Sort order"
        >
          <option value="asc">Name: A to Z</option>
          <option value="desc">Name: Z to A</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
            Search
          </button>
          <button type="button" onClick={handleReset} className="rounded border px-4 py-2 text-sm">
            Reset
          </button>
        </div>
      </form>

      {error && <div role="alert" className="mb-4 text-sm text-red-600">Error: {error}</div>}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone number</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date of birth</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Gender</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Roles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading customers...</td>
              </tr>
            ) : users.length > 0 ? users.map((user, index) => {
              const roles = user.roles ?? user.Roles
              const id = user.id ?? user.Id
              return (
                <tr key={id ?? index}>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">{getUserName(user)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">{user.email ?? user.Email ?? '-'}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">{user.phoneNumber ?? user.PhoneNumber ?? '-'}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">{formatDateOfBirth(user.dateOfBirth ?? user.DateOfBirth)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">{user.gender ?? user.Gender ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {Array.isArray(roles) && roles.length > 0 ? roles.join(', ') : '-'}
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Showing page {pageNumber} of {totalPages} — {totalCount} customers
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="customers-page-size" className="text-sm text-gray-500">Per page</label>
            <select
              id="customers-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPageNumber(1)
              }}
              className="rounded border bg-white px-2 py-1 text-sm"
            >
              {[10, 20, 30, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="rounded border bg-white px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <div className="hidden items-center gap-1 sm:flex">
            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setPageNumber(page)}
                className={`rounded px-3 py-1 ${page === pageNumber ? 'bg-indigo-600 text-white' : 'border bg-white'}`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.min(totalPages, page + 1))}
            disabled={pageNumber >= totalPages}
            className="rounded border bg-white px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

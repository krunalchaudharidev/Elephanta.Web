export default function Dashboard() {
  return (
    <>
      <div className="mb-8">
        <p className="text-[15px] font-medium text-gray-900">Dashboard</p>
        <p className="mt-2 text-[18px] text-gray-700">Welcome to the admin dashboard. <span className="text-gray-500">Build your panels here.</span></p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">248</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.8" d="M5 7h14M5 7l1 13h12l1-13M8 7V5a4 4 0 0 1 8 0v2"/></svg>
            </div>
          </div>
          <p className="mt-4 text-xs text-green-600">↑ 12% from last month</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">1,284</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.8" d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4"/></svg>
            </div>
          </div>
          <p className="mt-4 text-xs text-green-600">↑ 8.4% from last month</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customers</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">3,642</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" strokeWidth="1.8"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeWidth="1.8"/></svg>
            </div>
          </div>
          <p className="mt-4 text-xs text-green-600">↑ 5.2% from last month</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">₹8.42L</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v18M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
          </div>
          <p className="mt-4 text-xs text-green-600">↑ 14.6% from last month</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Welcome to Elephanta Admin</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Manage your products, categories, orders, customers and store settings from one convenient dashboard.</p>
          </div>

          <button className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">View Products
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </>
  )
}

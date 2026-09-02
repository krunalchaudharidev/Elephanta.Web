import { Outlet, Link } from 'react-router-dom'

export default function StoreLayout() {
  return (
    <div>
      <nav style={{display:'flex',gap:12,padding:12,borderBottom:'1px solid var(--border)'}}>
        <Link to="/store">Home</Link>
        <Link to="/store/products">Products</Link>
        <Link to="/store/cart">Cart</Link>
      </nav>
      <main style={{padding:20}}>
        <Outlet />
      </main>
    </div>
  )
}

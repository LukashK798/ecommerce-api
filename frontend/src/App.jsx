import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('client') // 'client' | 'admin'
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [currentFilter, setCurrentFilter] = useState('all')

  // Ilości wpisywane przez klienta do zakupu dla każdego produktu { [productId]: number }
  const [quantities, setQuantities] = useState({})

  // Ilości wpisywane przez magazyniera przy dostawie { [productId]: number }
  const [restockQuantities, setRestockQuantities] = useState({})

  // Pola formularza dodawania nowego produktu w panelu admina
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')

  // 1. POBIERANIE WSZYSTKICH PRODUKTÓW
  const fetchProducts = () => {
    fetch('http://localhost:8080/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Błąd serwera')
        return res.json()
      })
      .then(data => {
        setProducts(data)
        setCurrentFilter('all')
      })
      .catch(() => {
        setMessage('Brak połączenia z backendem Spring Boot (upewnij się, że działa na porcie 8080)!')
        setIsError(true)
      })
  }

  // 2. FILTR: POKAŻ TYLKO KOŃCZĄCE SIĘ PRODUKTY (ZAPYTANIE JPQL / SQL)
  const fetchLowStock = () => {
    fetch('http://localhost:8080/api/products/low-stock?threshold=5')
      .then(res => {
        if (!res.ok) throw new Error('Błąd serwera')
        return res.json()
      })
      .then(data => {
        setProducts(data)
        setCurrentFilter('low')
        setMessage('Filtrowanie: Produkty z zapasem poniżej 5 sztuk (dedykowane zapytanie SQL).')
        setIsError(false)
      })
      .catch(() => {
        setMessage('Błąd pobierania produktów o niskim stanie!')
        setIsError(true)
      })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Pobranie i zmiana wybranej liczby sztuk w sklepie
  const getQuantity = (id) => quantities[id] ?? 1
  const handleQuantityChange = (id, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1)
    setQuantities(prev => ({ ...prev, [id]: num }))
  }

  // Pobranie i zmiana liczby sztuk dostawy w panelu magazynu
  const getRestockQty = (id) => restockQuantities[id] ?? 5
  const handleRestockQtyChange = (id, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1)
    setRestockQuantities(prev => ({ ...prev, [id]: num }))
  }

  // 3. KUPNO PRODUKTU (WIDOK KLIENTA: POST /api/products/{id}/purchase?quantity=X)
  const handlePurchase = (id, productName) => {
    const qty = getQuantity(id)
    fetch(`http://localhost:8080/api/products/${id}/purchase?quantity=${qty}`, {
      method: 'POST'
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setMessage(data.message || 'Błąd zakupu')
          setIsError(true)
        } else {
          setMessage(`Pomyślnie zakupiono ${qty} szt. "${productName || data.name}"! W magazynie zostało: ${data.stockQuantity} szt.`)
          setIsError(false)
          fetchProducts()
        }
      })
      .catch(() => {
        setMessage('Błąd połączenia z serwerem podczas próby zakupu.')
        setIsError(true)
      })
  }

  // 4. DOSTAWA / UZUPEŁNIENIE MAGAZYNU (WIDOK ADMINA: PUT /api/products/{id})
  const handleRestock = (product, amount) => {
    const addAmount = Math.max(1, parseInt(amount, 10) || 1)
    fetch(`http://localhost:8080/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity + addAmount
      })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setMessage(data.message || 'Błąd aktualizacji stanu magazynowego!')
          setIsError(true)
        } else {
          setMessage(`Dostawa przyjęta: Dodano +${addAmount} szt. do produktu "${data.name}"! Nowy stan: ${data.stockQuantity} szt.`)
          setIsError(false)
          fetchProducts()
        }
      })
      .catch(() => {
        setMessage('Błąd połączenia z serwerem podczas aktualizacji magazynu.')
        setIsError(true)
      })
  }

  // 5. USUNIĘCIE PRODUKTU (WIDOK ADMINA: DELETE /api/products/{id})
  const handleDelete = (id, productName) => {
    if (!window.confirm(`Czy na pewno chcesz bezpowrotnie usunąć produkt "${productName}" (ID: #${id})?`)) {
      return
    }

    fetch(`http://localhost:8080/api/products/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) {
          setMessage('Błąd podczas usuwania produktu!')
          setIsError(true)
        } else {
          setMessage(`Produkt "${productName}" został pomyślnie usunięty z bazy danych.`)
          setIsError(false)
          fetchProducts()
        }
      })
      .catch(() => {
        setMessage('Błąd połączenia z serwerem podczas usuwania.')
        setIsError(true)
      })
  }

  // 6. DODANIE NOWEGO PRODUKTU (WIDOK ADMINA: POST /api/products)
  const handleAddProduct = (e) => {
    e.preventDefault()
    fetch('http://localhost:8080/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity, 10)
      })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setMessage(data.message || 'Błąd walidacji danych!')
          setIsError(true)
        } else {
          setMessage(`Dodano nowy produkt: "${data.name}" (ID: #${data.id}) do bazy PostgreSQL!`)
          setIsError(false)
          setName('')
          setDescription('')
          setPrice('')
          setStockQuantity('')
          fetchProducts()
        }
      })
      .catch(() => {
        setMessage('Błąd połączenia z serwerem podczas dodawania produktu.')
        setIsError(true)
      })
  }

  // Obliczenia statystyk magazynu
  const totalItemsCount = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0)
  const lowStockCount = products.filter(p => p.stockQuantity < 5).length

  return (
    <div className="dashboard-container">
      {/* Nagłówek aplikacji */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <span style={{ fontSize: '32px' }}>⚡</span>
          <div>
            <h1>E-Commerce Platform</h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Full-Stack System Handlowo-Magazynowy (Spring Boot 4 + React + PostgreSQL)
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge-tech">Spring Boot 4</span>
          <span className="badge-tech" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>PostgreSQL</span>
          <span className="badge-tech" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>React</span>
        </div>
      </header>

      {/* Przełącznik widoków: Klient vs Admin */}
      <div className="view-switcher">
        <button
          className={`tab-btn ${activeTab === 'client' ? 'active' : ''}`}
          onClick={() => setActiveTab('client')}
        >
          <span>🛍️</span> Sklep Klienta
        </button>
        <button
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <span>📦</span> Panel Magazynu (Admin)
        </button>
      </div>

      {/* Komunikat o operacji (Sukces / Błąd) */}
      {message && (
        <div className={`alert-box ${isError ? 'alert-error' : 'alert-success'}`}>
          <span>{isError ? '⚠️' : '✅'}</span>
          <span>{message}</span>
        </div>
      )}

      {/* ========================================================
          WIDOK 1: SKLEP KLIENTA
          ======================================================== */}
      {activeTab === 'client' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
              🛍️ Oferta Sklepu
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              Kupuj produkty bezpośrednio z magazynu. Każdy zakup weryfikuje dostępność i w bezpiecznej transakcji ACID zmniejsza stan magazynowy.
            </p>
          </div>

          <div className="store-grid">
            {products.map(p => {
              const isOutOfStock = p.stockQuantity === 0
              return (
                <div key={p.id} className="product-card">
                  <div>
                    <div className="product-card-top">
                      <div>
                        <div className="card-title">{p.name}</div>
                        <div className="card-desc">{p.description || 'Brak dodatkowego opisu produktu.'}</div>
                      </div>
                      <span className={`badge-stock ${isOutOfStock ? 'badge-low-stock' : 'badge-in-stock'}`}>
                        {isOutOfStock ? 'Brak na stanie' : `${p.stockQuantity} szt.`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Cena jednostkowa:</span>
                      <span className="card-price">{parseFloat(p.price).toFixed(2)} PLN</span>
                    </div>

                    <div className="card-actions">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <label style={{ fontSize: '12px', color: '#94a3b8' }}>Sztuk:</label>
                        <input
                          type="number"
                          min="1"
                          max={Math.max(1, p.stockQuantity)}
                          disabled={isOutOfStock}
                          value={getQuantity(p.id)}
                          onChange={e => handleQuantityChange(p.id, e.target.value)}
                          className="qty-input"
                        />
                      </div>
                      <button
                        onClick={() => handlePurchase(p.id, p.name)}
                        disabled={isOutOfStock}
                        className="btn-buy-card"
                      >
                        {isOutOfStock ? 'Wyprzedane' : '🛒 Kup teraz'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>Brak produktów w ofercie.</p>
              <p style={{ fontSize: '14px' }}>Przełącz na "Panel Magazynu (Admin)", aby dodać pierwsze towary!</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          WIDOK 2: PANEL MAGAZYNU (ADMIN)
          ======================================================== */}
      {activeTab === 'admin' && (
        <div>
          {/* Karty statystyk magazynowych */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Liczba Pozycji w Katalogu</span>
              <span className="stat-value">{products.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Łączny Zapas Wszystkich Towarów</span>
              <span className="stat-value">
                {totalItemsCount} <span style={{ fontSize: '14px', color: '#94a3b8' }}>szt.</span>
              </span>
            </div>
            <div
              className="stat-card"
              style={{ borderColor: lowStockCount > 0 ? 'rgba(239, 68, 68, 0.4)' : '#1f2937' }}
            >
              <span className="stat-label">Kończące się Zapasy (&lt; 5 szt.)</span>
              <span className="stat-value" style={{ color: lowStockCount > 0 ? '#f87171' : '#34d399' }}>
                {lowStockCount}
              </span>
            </div>
          </div>

          {/* Pasek filtrowania */}
          <div className="toolbar">
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>
              Stan Magazynowy Produktów
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={fetchProducts}
                className={`btn-filter ${currentFilter === 'all' ? 'active' : ''}`}
              >
                Wszystkie pozycje
              </button>
              <button
                onClick={fetchLowStock}
                className={`btn-filter warning-filter ${currentFilter === 'low' ? 'active' : ''}`}
              >
                ⚠️ Niski stan (&lt; 5 szt.) [Zapytanie SQL]
              </button>
            </div>
          </div>

          {/* Tabela magazynowa */}
          <div className="table-card">
            <table className="product-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>ID</th>
                  <th>Produkt</th>
                  <th>Opis</th>
                  <th>Cena</th>
                  <th>Stan</th>
                  <th style={{ textAlign: 'right' }}>Zarządzaj Magazynem</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>#{p.id}</td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{p.name}</td>
                    <td style={{ color: '#94a3b8' }}>{p.description || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {parseFloat(p.price).toFixed(2)} PLN
                    </td>
                    <td>
                      <span className={`badge-stock ${p.stockQuantity < 5 ? 'badge-low-stock' : 'badge-in-stock'}`}>
                        {p.stockQuantity === 0 ? 'Brak na stanie (0 szt.)' : `${p.stockQuantity} szt.`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min="1"
                          value={getRestockQty(p.id)}
                          onChange={e => handleRestockQtyChange(p.id, e.target.value)}
                          className="qty-input"
                          style={{ width: '56px', padding: '6px 8px', fontSize: '13px' }}
                          title="Wpisz liczbę sztuk dostawy"
                        />
                        <button
                          onClick={() => handleRestock(p, getRestockQty(p.id))}
                          className="btn-restock"
                          title={`Zwiększ stan magazynowy o ${getRestockQty(p.id)} szt. (PUT /api/products/{id})`}
                        >
                          📦 Dostawa (+{getRestockQty(p.id)})
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn-delete"
                          title="Usuń produkt trwale z bazy danych (DELETE /api/products/{id})"
                        >
                          🗑️ Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      Brak produktów w bazie magazynowej. Dodaj produkt poniżej!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Formularz dodawania nowego produktu */}
          <div className="form-card">
            <h3 className="form-title">➕ Dodaj Nowy Produkt do Bazy Magazynowej</h3>
            <form onSubmit={handleAddProduct} className="form-grid">
              <div className="form-group">
                <label>Nazwa Produktu *</label>
                <input
                  className="form-input"
                  placeholder="np. Klawiatura Mechaniczna RGB"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cena (PLN) *</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="np. 349.99"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Opis Produktu</label>
                <input
                  className="form-input"
                  placeholder="np. Przełączniki Brown, podświetlenie RGB"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Początkowy Stan Magazynowy *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="np. 20"
                  value={stockQuantity}
                  onChange={e => setStockQuantity(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-submit">
                💾 Zapisz Produkt w PostgreSQL (POST /api/products)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
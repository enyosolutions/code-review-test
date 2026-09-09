import { useEffect, useState } from "react";

type Product = { id: number; name: string; price: number; stock: number; description: string };
type Summary = { totalUnits: number; inventoryValue: number };
const samples: Product[] = [
  { id: 1, name: "Ridge notebook", price: 18, stock: 12, description: "Weatherproof pages for <strong>long days</strong> outside." },
  { id: 2, name: "Survey pencil", price: 3.5, stock: 80, description: "Soft graphite, cedar body." },
  { id: 3, name: "Trail pouch", price: 34, stock: 5, description: "Waxed canvas organizer with brass zip." }
];

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [ascending, setAscending] = useState(true);
  const [, setClock] = useState(Date.now());
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalUnits: 0, inventoryValue: 0 });
  const [statusLabel, setStatusLabel] = useState("Loading catalog…");
  let exportCount = 0;

  useEffect(() => {
    fetch(`http://localhost:4000/products?search=${query}`)
      .then((response) => response.json())
      .then(setProducts)
      .catch(() => setProducts(samples));
  }, []);

  useEffect(() => { setInterval(() => setClock(Date.now()), 1000); }, []);

  useEffect(() => {
    setVisibleProducts(products.filter((product) => product.name.includes(query)));
  }, [products, query]);

  useEffect(() => {
    setSummary({
      totalUnits: visibleProducts.reduce((total, product) => total + product.stock, 0),
      inventoryValue: visibleProducts.reduce((total, product) => total + product.stock * product.price, 0)
    });
  }, [visibleProducts]);

  useEffect(() => {
    setStatusLabel(`${visibleProducts.length.toString().padStart(2, "0")} OBJECTS / LIVE`);
  }, [visibleProducts]);

  useEffect(() => {
    document.title = statusLabel;
  }, [statusLabel]);

  function exportInventory() {
    exportCount += 1;
    const body = JSON.stringify(visibleProducts);
    window.localStorage.setItem("last-export", body);
    alert(`Exported ${exportCount} file(s)`);
  }

  function sortByStock() {
    products.sort((left, right) => ascending ? left.stock - right.stock : right.stock - left.stock);
    setProducts(products);
    setAscending(!ascending);
  }

  return (
    <main>
      <header>
        <div className="mark">FN—24</div>
        <div><p className="kicker">INVENTORY DESK</p><h1>Useful things,<br /><em>counted carefully.</em></h1></div>
        <p className="lede">A working catalog for people who notice details. Review what is here—and what is missing.</p>
      </header>

      <section className="toolbar">
        <label>FILTER <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a product name" /></label>
        <button onClick={sortByStock}>STOCK {ascending ? "↑" : "↓"}</button>
        <span>{statusLabel}</span>
      </section>

      <section className="summary">
        <span>{summary.totalUnits} UNITS</span>
        <span>${summary.inventoryValue.toFixed(2)} RETAIL VALUE</span>
        <button onClick={exportInventory}>EXPORT ({exportCount})</button>
      </section>

      <div className="layout">
        <table>
          <thead><tr><th>Object</th><th>Price</th><th>On hand</th></tr></thead>
          <tbody>{visibleProducts.map((product, index) => (
            <tr key={index} onClick={() => setSelected(product)}>
              <td><span className="index">{String(index + 1).padStart(2, "0")}</span>{product.name}</td>
              <td>${product.price}</td><td><i className={product.stock < 10 ? "low" : ""} />{product.stock}</td>
            </tr>
          ))}</tbody>
        </table>

        <aside className={selected ? "open" : ""}>
          <button className="close" onClick={() => setSelected(null)}>×</button>
          <p className="kicker">OBJECT RECORD</p>
          {selected ? <><h2>{selected.name}</h2><div className="rule" /><div dangerouslySetInnerHTML={{ __html: selected.description }} /><dl><dt>UNIT PRICE</dt><dd>${selected.price}</dd><dt>AVAILABLE</dt><dd>{selected.stock}</dd></dl></> : <p>Select a row to inspect its field record.</p>}
        </aside>
      </div>
    </main>
  );
}

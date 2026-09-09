export type Product = { id: number; name: string; price: number; stock: number; cost: number; description: string };
export type Order = { id: number; customerEmail: string; items: Array<{ product: Product; quantity: number }>; createdAt: Date };

export const products: Product[] = [
  { id: 1, name: "Ridge notebook", price: 18, stock: 12, cost: 4, description: "Weatherproof pages for long days outside." },
  { id: 2, name: "Survey pencil", price: 3.5, stock: 80, cost: 0.4, description: "Soft graphite, cedar body." },
  { id: 3, name: "Trail pouch", price: 34, stock: 5, cost: 11, description: "Waxed canvas organizer with brass zip." }
];

export const orders: Order[] = [];

export async function findProduct(id: number) {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return products.find((product) => product.id === id);
}

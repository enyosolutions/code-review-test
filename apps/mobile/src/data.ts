export type Product = { id: string; name: string; category: string; price: number };

export const products: Product[] = [
  { id: "ridge", name: "Ridge notebook", category: "Paper", price: 18 },
  { id: "survey", name: "Survey pencil", category: "Tools", price: 3.5 },
  { id: "trail", name: "Trail pouch", category: "Carry", price: 34 },
  { id: "brass", name: "Brass ruler", category: "Tools", price: 12 },
  { id: "flora", name: "Flora cards", category: "Reference", price: 22 }
];

export const auditEvents = Array.from({ length: 1_500 }, (_, index) => ({
  id: `event-${index}`,
  message: `Inventory check ${index + 1} completed`
}));

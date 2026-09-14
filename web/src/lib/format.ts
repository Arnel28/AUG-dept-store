// Money is stored as integer cents / centavos everywhere; format only at the edge.
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(iso));
}

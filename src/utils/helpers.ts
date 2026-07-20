export const discountPct = (book: { mrp: number; price: number }) => Math.round(((book.mrp - book.price) / book.mrp) * 100);
export const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

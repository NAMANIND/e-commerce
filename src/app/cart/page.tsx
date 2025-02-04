import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";

export default function CartPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_384px] gap-8">
          <CartItems />
          <CartSummary />
        </div>
      </div>
    </main>
  );
}

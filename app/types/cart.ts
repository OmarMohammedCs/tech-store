export interface CartItem {
    description: string;
    name: string;
    id: string;
    title: string;
    price: number;
    image?: string;
    quantity: number;
  }
  
  export interface CartStore {
    cart: CartItem[];
  
    addToCart: (product: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    increaseQty: (id: string) => void;
    decreaseQty: (id: string) => void;
    clearCart: () => void;
  
    totalItems: () => number;
    totalPrice: () => number;
  }
  
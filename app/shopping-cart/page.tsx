import { Suspense } from "react";
import ShoppingCartClient from "./shoppingCartClient";
import Loading from "@/components/loading";

export default function ShoppingCart() {

  return (
      <Suspense fallback={<Loading />}>

        <ShoppingCartClient />
      </Suspense>
  );
}

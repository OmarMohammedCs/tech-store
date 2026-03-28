import { Suspense } from "react";
import ProductsClient from "./productsClient";
import Loading from "@/components/loading";



export default function Products() {

  
  return (
       <Suspense fallback={<Loading />}>
 <ProductsClient />
    </Suspense>
  );
}

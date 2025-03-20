import CartTable from "./table";
import { getCart } from "@/lib/actions/cart.actions";

export const metadata = {
    title:"Shooping Cart"
}
    
const CartPage = async () => {
    const cart = await getCart();
    return ( <>
            <CartTable cart={cart} />
        </> )
    ;
}
export default CartPage;
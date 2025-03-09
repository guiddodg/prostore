import ProductList from '@/components/shared/product/product-list';
import { getLatestProducts } from '@/lib/actions/product.actions';
import { formatNumberWithDecimalPlaces } from '@/lib/utils';


const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const formattedProducts = latestProducts.map((product) => ({
    ...product,
    price: formatNumberWithDecimalPlaces(Number(product.price.toString())),
    rating:formatNumberWithDecimalPlaces(Number(product.rating.toString())),
  }));

  return  (<>
    <ProductList 
    data={formattedProducts} 
    title="Productos destacados"
    />
  </>) ;
}
 
export default Homepage;
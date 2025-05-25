import ProductList from "@/components/shared/product/product-list";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";
import { formatNumberWithDecimalPlaces } from "@/lib/utils";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  const formattedProducts = latestProducts.map((product) => ({
    ...product,
    price: formatNumberWithDecimalPlaces(Number(product.price.toString())),
    rating: formatNumberWithDecimalPlaces(Number(product.rating.toString())),
  }));

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={formattedProducts} title="Productos destacados" />
      <ViewAllProductsButton />
    </>
  );
};

export default Homepage;

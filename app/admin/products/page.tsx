import Link from "next/link";
import { getAllProducts, deleteProduct } from "@/lib/actions/product.actions";
import { formatCurrency, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import DeleteDialog from "@/components/shared/delete-dialog";

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const { page, query, category } = searchParams;

  const products = await getAllProducts({
    query: query || undefined,
    limit: 5,
    page: Number(page) || 1,
    category: category || undefined,
  });

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Products</h1>
          {query && (
            <div>
              Filtered by <i>&quot;{query}&quot;</i>{" "}
              <Link href="/admin/products">
                <Button variant="outline" size="sm">
                  Clear Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Button asChild variant="default">
          <Link href="/admin/products/create">Create Product</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead className="text-right">PRICE</TableHead>
            <TableHead>CATEGORY</TableHead>
            <TableHead>STOCK</TableHead>
            <TableHead>RATING</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data.map((product) => (
            <TableRow key={product.id}>
              <TableHead>{formatId(product.id)}</TableHead>
              <TableHead>{product.name}</TableHead>
              <TableHead className="text-right">
                {formatCurrency(Number(product.price))}
              </TableHead>
              <TableHead>{product.category}</TableHead>
              <TableHead>{product.stock}</TableHead>
              <TableHead>{product.rating}</TableHead>
              <TableHead className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableHead>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {products.totalPages > 1 && (
        <Pagination page={Number(page) || 1} totalPages={products.totalPages} />
      )}
    </div>
  );
};

export default AdminProductsPage;

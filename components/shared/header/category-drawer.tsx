import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getProductCategories } from "@/lib/actions/product.actions";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

const CategoryDrawer = async () => {
  const categories = await getProductCategories();

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-xs">
        <DrawerHeader>
          <DrawerTitle>Select a Category</DrawerTitle>
          <div className="space-y-1 mt-4">
            {categories.map((category) => (
              <Button
                key={category.category}
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <DrawerClose asChild>
                  <Link href={`/search?category=${category.category}`}>
                    {category.category} ({category._count.toString()})
                  </Link>
                </DrawerClose>
              </Button>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoryDrawer;

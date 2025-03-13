import { Button } from "@/components/ui/button";
import ModeToogle from "./mode-toogle";
import Link from "next/link";
import { EllipsisVertical, ShoppingCart, UserIcon } from "lucide-react";
import { Sheet,SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Menu = () => {
    return ( 
        <div className="flex justify-end gap-3">
            <nav className="hidden md:flex w-full max-w-ws gap-1">
            <ModeToogle />
                <Button asChild variant='ghost'>
                    <Link href='/cart'>
                      <ShoppingCart />Carrito
                    </Link>
                </Button>
                <Button asChild>
                    <Link href='/sign-in'>
                      <UserIcon />Sing in
                    </Link>
                </Button>
            </nav>
            <nav className="md:hidden" >
                <Sheet>
                    <SheetTrigger className="aling-mid">
                        <EllipsisVertical />
                    </SheetTrigger >
                    <SheetContent className="flex flex-col items-start">
                        <SheetTitle>Menu</SheetTitle>
                        <ModeToogle />
                        <Button asChild variant='ghost'>
                            <Link href='/cart'>
                                <ShoppingCart />Cart
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href='/sing-in'>
                                <UserIcon />Sing in
                            </Link>
                        </Button>
                        <SheetDescription></SheetDescription>
                    </SheetContent>
                </Sheet>
            </nav>
        </div> 
    );
}
 
export default Menu;
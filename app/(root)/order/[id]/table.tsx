"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  createPayPalOrder,
  approvePayPalOrder,
  updateOrderToPaidCOD,
  deliverOrder,
} from "@/lib/actions/order.actions";
import { toast } from "sonner";
import { useTransition } from "react";

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
}) => {
  const {
    id,
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid,
    isDelivered,
    paidAt,
    deliveredAt,
    paymentMethod,
  } = order;

  const PrintLoadingState = () => {
    const [{ isPending }] = usePayPalScriptReducer();
    if (isPending) return "Loading PayPal...";
    return "Error Loading PayPal";
  };

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);
    if (!res) {
      toast.error("Error creating PayPal order");
      return;
    }
    return res.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);
    if (!res) {
      toast.error("Error approving PayPal order");
      return;
    }
    if (res.success) {
      toast.success("Order paid successfully");
      window.location.reload();
    } else {
      toast.error(res.message);
    }
  };

  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await updateOrderToPaidCOD(order.id);
            if (!res.success) {
              toast.error("Error marking order as paid");
              return;
            }
            toast.success("Order marked as paid successfully");
          });
        }}
      >
        {isPending ? "Processing..." : "Mark as Paid"}
      </Button>
    );
  };

  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await deliverOrder(order.id);
            if (!res.success) {
              toast.error("Error marking order as delivered");
              return;
            }
            toast.success("Order marked as delivered successfully");
          });
        }}
      >
        {isPending ? "Processing..." : "Mark as Delivered"}
      </Button>
    );
  };

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(order.id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="md:col-span-2 overflow-x-auto space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p className="mb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant={"secondary"}>
                  Paid at {formatDate(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant={"destructive"}>Not paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullname}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant={"secondary"}>
                  Delivered at {formatDate(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant={"destructive"}>Not delivered</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="p-4 gap-4">
            <h2 className="text-xl pb-4">Order Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="px-2">{item.qty}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="px-2">${item.price}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(Number(order.itemsPrice))}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(Number(order.taxPrice))}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(Number(order.shippingPrice))}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(Number(order.totalPrice))}</div>
              </div>
              {!isPaid && paymentMethod === "PayPal" && (
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
              )}

              {/* Cash on delivery */}
              {!isPaid && isAdmin && paymentMethod === "CashOnDelivery" && (
                <MarkAsPaidButton />
              )}
              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
              {/* End cash on delivery */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;

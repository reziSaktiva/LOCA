import { OrderListItem, type OrderListItemData } from "./order-list-item";

export type OrderListProps = {
  orders: OrderListItemData[];
};

export function OrderList({ orders }: OrderListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderListItem order={order} />
        </li>
      ))}
    </ul>
  );
}

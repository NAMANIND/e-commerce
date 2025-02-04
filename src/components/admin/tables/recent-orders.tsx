import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const orders = [
  {
    id: "ORD001",
    customer: "John Doe",
    status: "processing",
    total: 125.99,
    date: "2024-01-07T10:30:00",
  },
  {
    id: "ORD002",
    customer: "Jane Smith",
    status: "shipped",
    total: 249.99,
    date: "2024-01-07T09:15:00",
  },
  {
    id: "ORD003",
    customer: "Bob Johnson",
    status: "pending",
    total: 75.5,
    date: "2024-01-07T08:45:00",
  },
  {
    id: "ORD004",
    customer: "Alice Brown",
    status: "delivered",
    total: 199.99,
    date: "2024-01-07T07:30:00",
  },
  {
    id: "ORD005",
    customer: "Charlie Wilson",
    status: "processing",
    total: 149.99,
    date: "2024-01-07T06:15:00",
  },
];

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
} as const;

export function RecentOrders() {
  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>
                <Badge
                  className={
                    statusStyles[order.status as keyof typeof statusStyles]
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

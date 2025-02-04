import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const products = [
  {
    id: "PROD001",
    name: "Wireless Headphones",
    sku: "WH-001",
    stock: 5,
    threshold: 10,
    price: 99.99,
  },
  {
    id: "PROD002",
    name: "Smart Watch",
    sku: "SW-001",
    stock: 3,
    threshold: 8,
    price: 199.99,
  },
  {
    id: "PROD003",
    name: "Bluetooth Speaker",
    sku: "BS-001",
    stock: 2,
    threshold: 15,
    price: 79.99,
  },
  {
    id: "PROD004",
    name: "Gaming Mouse",
    sku: "GM-001",
    stock: 7,
    threshold: 20,
    price: 49.99,
  },
  {
    id: "PROD005",
    name: "USB-C Cable",
    sku: "UC-001",
    stock: 4,
    threshold: 25,
    price: 14.99,
  },
];

export function LowStockProducts() {
  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>
                <Badge
                  className={
                    product.stock <= product.threshold / 2
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {product.stock} left
                </Badge>
              </TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

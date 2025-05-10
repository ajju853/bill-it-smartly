
import { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/lib/storage";

interface CustomerFormProps {
  customer: Customer;
  onCustomerChange: (customer: Customer) => void;
}

export default function CustomerForm({
  customer,
  onCustomerChange,
}: CustomerFormProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onCustomerChange({
      ...customer,
      [name]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="required">Customer Name</Label>
          <Input
            id="customerName"
            name="name"
            value={customer.name}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              name="email"
              type="email"
              value={customer.email || ""}
              onChange={handleChange}
              placeholder="Enter customer email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              id="customerPhone"
              name="phone"
              value={customer.phone || ""}
              onChange={handleChange}
              placeholder="Enter customer phone"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            name="address"
            value={customer.address || ""}
            onChange={handleChange}
            placeholder="Enter customer address"
          />
        </div>
      </CardContent>
    </Card>
  );
}

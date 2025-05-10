
import { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GroceryBillingDetails } from "@/lib/storage";

interface GroceryBillingFormProps {
  details: GroceryBillingDetails;
  onDetailsChange: (details: GroceryBillingDetails) => void;
}

export default function GroceryBillingForm({
  details,
  onDetailsChange,
}: GroceryBillingFormProps) {
  const handleWeightToggle = (checked: boolean) => {
    onDetailsChange({
      ...details,
      isWeightBased: checked,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grocery Billing Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="weight-based"
            checked={details.isWeightBased}
            onCheckedChange={handleWeightToggle}
          />
          <Label htmlFor="weight-based">Enable weight-based pricing</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          {details.isWeightBased
            ? "When enabled, quantity will be treated as weight (e.g., kg, g, lb)"
            : "When disabled, quantity will be treated as count (e.g., items, pieces, units)"}
        </p>
      </CardContent>
    </Card>
  );
}

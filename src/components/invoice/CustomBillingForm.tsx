
import { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { CustomBillingDetails } from "@/lib/storage";

interface CustomBillingFormProps {
  details: CustomBillingDetails;
  onDetailsChange: (details: CustomBillingDetails) => void;
}

export default function CustomBillingForm({
  details,
  onDetailsChange,
}: CustomBillingFormProps) {
  const handleFieldChange = (index: number, key: string, value: string) => {
    const updatedFields = [...details.customFields];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    
    onDetailsChange({
      ...details,
      customFields: updatedFields,
    });
  };

  const addField = () => {
    onDetailsChange({
      ...details,
      customFields: [...details.customFields, { key: "", value: "" }],
    });
  };

  const removeField = (index: number) => {
    const updatedFields = [...details.customFields];
    updatedFields.splice(index, 1);
    
    onDetailsChange({
      ...details,
      customFields: updatedFields,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Billing Details</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={addField}
          className="h-8 px-2 lg:px-3"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Field
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.customFields.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No custom fields added yet. Click "Add Field" to create custom fields.
          </p>
        ) : (
          details.customFields.map((field, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Field name"
                value={field.key}
                onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Field value"
                value={field.value}
                onChange={(e) => handleFieldChange(index, "value", e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeField(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove field</span>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

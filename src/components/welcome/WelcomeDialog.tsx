
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisitedBefore) {
      setIsOpen(true);
      // Set flag in localStorage so dialog doesn't show on subsequent visits
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Welcome to Smart Billing System</DialogTitle>
          <DialogDescription className="text-center pt-4">
            <p className="mb-2">This project was developed by</p>
            <p className="text-lg font-medium text-primary">Ajay and Jaydip</p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

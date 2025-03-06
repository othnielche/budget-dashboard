import React, { useState, useContext } from 'react';
import { AuthContext } from "@/contexts/authContext";
import API from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HandCoins, LoaderCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

const CreateRequisitionForm = ({ budgetLineId, budgetLineName, maxQuantity, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [quantityRequested, setQuantityRequested] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if user can make requisitions (only ADMIN and ESTATE_MANAGER can make requisitions)
  const canMakeRequisition = [1, 4].includes(user.roleCode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quantityRequested || parseFloat(quantityRequested) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (parseFloat(quantityRequested) > parseFloat(maxQuantity)) {
      toast.error(`Requested quantity cannot exceed the budgeted amount of ${maxQuantity}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await API.post('/requisition/create-requisition', {
        budgetLineId,
        quantityRequested: parseFloat(quantityRequested),
        comment
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setSuccess(true);
      toast.success('Requisition created successfully');
      
      // Reset form
      setQuantityRequested('');
      setComment('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating requisition:', error);
      toast.error(error.response?.data?.message || 'Failed to create requisition');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canMakeRequisition) {
    return (
      <div className="p-4 bg-muted rounded-md">
        <p className="text-muted-foreground">
          Your role does not have permission to make requisitions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="budgetLine" className="block text-sm font-medium mb-1">
          Budget Line
        </label>
        <Input 
          id="budgetLine"
          value={budgetLineName}
          disabled
          className="bg-muted"
        />
      </div>
      
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium mb-1">
          Quantity Requested <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center">
          <Input 
            id="quantity"
            type="number"
            step="0.01"
            value={quantityRequested}
            onChange={(e) => setQuantityRequested(e.target.value)}
            placeholder="Enter quantity"
            required
            className="flex-1"
          />
          <span className="ml-2 text-sm text-muted-foreground">
            Max: {maxQuantity}
          </span>
        </div>
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Comment
        </label>
        <Textarea 
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add any additional information about this requisition"
          rows={3}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || success}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : success ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Requisition Created
          </>
        ) : (
          <>
            <HandCoins className="mr-2 h-4 w-4" />
            Make Requisition
          </>
        )}
      </Button>
    </form>
  );
};

export default CreateRequisitionForm; 
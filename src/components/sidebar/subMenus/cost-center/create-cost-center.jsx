// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import API from '@/lib/axios';
// import React, { useState, useContext } from 'react';
// import { AuthContext } from '@/contexts/authContext';
// import { useToast } from '@/hooks/use-toast';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// const CreateCostCenter = () => {
//   const { toast } = useToast();
//   const [CostCenterCode, setCostCenterCode] = useState("");
//   const [CostCenterName, setCostCenterName] = useState("");
//   const { user } = useContext(AuthContext);
//   const [open, setOpen] = useState(false);

//   const handleCreateCostCenter = () => {
//     setOpen(true);
//   };

//   const handleConfirm = async () => {
//     try {
//       const response = await API.post("/cost-center/add-cost-center", {
//         CostCenterCode: CostCenterCode,
//         CostCenterName: CostCenterName
//       }, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           "Content-Type": "application/json",
//         }
//       });

//       if (response.data.success) {
//         toast({
//           title: "Success!",
//           description: "Cost center created successfully",
//           variant: "success",
//         });
//         setCostCenterCode("");
//         setCostCenterName("");
//       } else {
//         console.error(response.data.error);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//     setOpen(false);
//   };

//   const handleCancel = () => {
//     setOpen(false);
//   };

//   return (
//     <div>
//       <form>
//         <div className='flex flex-col mt-4 ml-2'>
//           <div className='flex flex-row'>
//             <div className='w-1/4'>
//               <Label htmlFor='Matricule'>Cost Center Code</Label>
//               <Input
//                 id='CostCenterCode'
//                 type='text'
//                 placeholder='cost center code'
//                 value={CostCenterCode}
//                 onChange={(e) => setCostCenterCode(e.target.value)}
//                 required
//               />
//             </div>
//             <div className='ml-4 w-1/4'>
//               <Label htmlFor='text'>Cost Center Name</Label>
//               <Input
//                 id='CostCenterName'
//                 type='text'
//                 value={CostCenterName}
//                 onChange={(e) => setCostCenterName(e.target.value)}
//                 placeholder='cost center name'
//                 required
//               />
//             </div>
//           </div>
//           <div className='mt-4 w-1/2'>
//             <Button type="submit" onClick={handleCreateCostCenter}>Create Cost Center</Button>
//           </div>
//         </div>
//       </form>
//       <AlertDialog open={open} onOpenChange={setOpen}>
//         <AlertDialogTrigger asChild>
//           <span></span>
//         </AlertDialogTrigger>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Cost Center Creation</AlertDialogTitle>
//           </AlertDialogHeader>
//           <AlertDialogDescription>
//             Are you sure you want to create a new cost center with code {CostCenterCode} and name {CostCenterName}?
//           </AlertDialogDescription>
//           <AlertDialogFooter>
//             <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default CreateCostCenter;

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import API from '@/lib/axios';
import React, { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CreateCostCenter = () => {
  const { toast } = useToast();
  const [costCenterCode, setCostCenterCode] = useState("");
  const [costCenterName, setCostCenterName] = useState("");
  const { user } = useContext(AuthContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!costCenterCode.trim() || !costCenterName.trim()) {
      toast({
        title: "Validation Error",
        description: "Both Cost Center Code and Name are required",
        variant: "destructive",
      });
      return;
    }

    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await API.post("/cost-center/add-cost-center", {
        CostCenterCode: costCenterCode,
        CostCenterName: costCenterName
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });

      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Cost center created successfully",
          variant: "default",
        });
        
        setCostCenterCode("");
        setCostCenterName("");
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to create cost center",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit}>
        <div className='flex flex-col space-y-4'>
          <div className='flex space-x-4'>
            <div className='flex-1'>
              <Label htmlFor='CostCenterCode'>Cost Center Code</Label>
              <Input
                id='CostCenterCode'
                type='text'
                placeholder='Enter cost center code'
                value={costCenterCode}
                onChange={(e) => setCostCenterCode(e.target.value)}
                required
              />
            </div>
            <div className='flex-1'>
              <Label htmlFor='CostCenterName'>Cost Center Name</Label>
              <Input
                id='CostCenterName'
                type='text'
                placeholder='Enter cost center name'
                value={costCenterName}
                onChange={(e) => setCostCenterName(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit">Create Cost Center</Button>
        </div>
      </form>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cost Center Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create a new cost center?
              <div className="mt-2">
                <strong>Code:</strong> {costCenterCode}<br />
                <strong>Name:</strong> {costCenterName}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateCostCenter;
// src/components/sidebar/subMenus/cost-unit/create-cost-unit.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import API from '@/lib/axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';


const CreateCostUnit = () => {
  const { user } = useContext(AuthContext);
  const [costUnitCode, setCostUnitCode] = useState("");
  const [costUnitName, setCostUnitName] = useState("");
  const [open, setOpen] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const [alertDialogTitle, setAlertDialogTitle] = useState("");

  const handleCreateCostUnit = async () => {
    try {
      const response = await API.post("/cost-unit/create-cost-unit", {
        CostUnitCode: costUnitCode,
        CostUnitName: costUnitName,
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });
      if (response.data && response.data.success) {
        setAlertDialogTitle("Success!");
        setAlertDialogMessage("Cost unit created successfully!");
        setCostUnitCode("");
        setCostUnitName("");
        setOpenAlertDialog(true);
      } else {
        setAlertDialogTitle("Error");
        setAlertDialogMessage("Failed to create cost unit. Please try again.");
        setOpenAlertDialog(true);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setAlertDialogTitle("Error");
        setAlertDialogMessage(`Failed to create cost unit. Reason: ${error.response.data.error}`);
        setOpenAlertDialog(true);
      } else {
        setAlertDialogTitle("Error");
        setAlertDialogMessage("Failed to create cost unit. Please try again.");
        setOpenAlertDialog(true);
      }
    }
  };

  const handleCancel = () => {
    setCostUnitCode("");
    setCostUnitName("");
    setOpen(false);
  };

  const handleAlertDialogClose = () => {
    setOpenAlertDialog(false);
  };

  return (
    <div className="flex flex-col">
      <div className="font-medium text-xl mt-10">
        <text className="">Create New Cost Unit</text>
      </div>
      <div className="flex max-w-screen-xl mt-4">
        <form>
          <div className="flex flex-col">
            <Label htmlFor="costUnitCode">Cost Unit Code</Label>
            <Input
              id="costUnitCode"
              type="text"
              value={costUnitCode}
              onChange={(e) => setCostUnitCode(e.target.value)}
            />
          </div>
          <div className="flex flex-col mt-4">
            <Label htmlFor="costUnitName">Cost Unit Name</Label>
            <Input
              id="costUnitName"
              type="text"
              value={costUnitName}
              onChange={(e) => setCostUnitName(e.target.value)}
            />
          </div>
          <div className="flex flex-col mt-4">
            <Button variant="primary" onClick={handleCreateCostUnit}>Create</Button>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </form>
      </div>
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {alertDialogMessage}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button variant="outline" onClick={handleAlertDialogClose}>OK</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateCostUnit;
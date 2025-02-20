import { AuthContext } from '@/contexts/authContext'
import React, { useContext } from 'react'

function CreateMeasuringUnit() {
  const { user } = useContext(AuthContext);
  const [measuringUnitName, setMeasuringUnitName] = useState("");
  const [measuringUnitSymbol, setMeasuringUnitSymbol] = useState("");
  const [open, setOpen] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const [alertDialogTitle, setAlertDialogTitle] = useState("");

  const handleCreateMeasuringUnit = () => {
    setOpen(true);
  }

  const handleConfirm = async () => {
    try {
      if (measuringUnitName && measuringUnitSymbol) {
        
        const response = await API.post("measuring-unit/add-measuring-unit", {
          MeasuringUnitName: measuringUnitName, 
          MeasuringUnitSymbol: measuringUnitSymbol
                },  {
                  headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                  }
                });
          
                if (response.data.success) {
                  setAlertDialogTitle('Success!');
                  setAlertDialogMessage("Measuring Unit Created Successfully!");
                  setOpenAlertDialog(true);
                  setMeasuringUnitName("");
                  setMeasuringUnitSymbol("");
                }
                
              } else {
                setAlertDialogMessage('Both measuring unit name and symbol are required')
                setOpenAlertDialog(true)  
              }
            } catch (error) {
              if (error.resposne && error.response.data) {
                setAlertDialogTitle("Error!");
                console.error(error);
                setAlertDialogMessage(`Failed to create measuring unit. Reason: ${error.response.data.error || "try again"}`);
              }
            } finally {
              setOpen(false);
            }
          }
  return (
    <div></div>
  )
}

export default CreateMeasuringUnit
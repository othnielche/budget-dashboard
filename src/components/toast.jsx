import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"

export function ToastDemo() {
  const { toast } = useToast()

  return (
    <div>
        <Button
        variant="outline"
        onClick={() => {
            toast({
            title: "Scheduled: Catch up ",
            description: "Friday, February 10, 2023 at 5:57 PM",
            action: (
                <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
            ),
            })
        }}
        >
        Add to calendar
        </Button>
    </div>
  )
}

export default ToastDemo
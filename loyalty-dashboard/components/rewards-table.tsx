import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

const rewards = [
  {
    name: "Free Drink",
    points: "200",
    status: "Active",
    redeemed: "32",
    thisWeek: "5",
    lastEdited: "Apr 21",
  },
  {
    name: "Free Dessert",
    points: "350",
    status: "Active",
    redeemed: "28",
    thisWeek: "3",
    lastEdited: "Apr 19",
  },
  {
    name: "25% Off Meal",
    points: "500",
    status: "Inactive",
    redeemed: "45",
    thisWeek: "0",
    lastEdited: "Mar 30",
  },
  {
    name: "Free Chips",
    points: "150",
    status: "Active",
    redeemed: "60",
    thisWeek: "8",
    lastEdited: "Apr 22",
  },
  {
    name: "Buy-1-get-1-Free",
    points: "400",
    status: "Active",
    redeemed: "15",
    thisWeek: "2",
    lastEdited: "Apr 15",
  },
]

export function RewardsTable() {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reward Name</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Redeemed</TableHead>
            <TableHead>This Week</TableHead>
            <TableHead>Last Edited</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.name}>
              <TableCell className="font-medium">{reward.name}</TableCell>
              <TableCell>{reward.points}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      reward.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {reward.status}
                </div>
              </TableCell>
              <TableCell>{reward.redeemed}</TableCell>
              <TableCell>{reward.thisWeek}</TableCell>
              <TableCell>{reward.lastEdited}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500">
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

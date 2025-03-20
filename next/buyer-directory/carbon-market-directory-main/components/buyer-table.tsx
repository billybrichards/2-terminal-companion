import { ArrowUpDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function BuyerTable() {
  const buyers = [
    {
      id: 1,
      name: "Microsoft",
      industry: "Technology",
      volume: "8M credits",
      projectTypes: ["Nature-based", "Removal"],
      lastPurchase: "2024",
      netZeroTarget: "2030",
    },
    {
      id: 2,
      name: "Shell",
      industry: "Energy",
      volume: "50M credits",
      projectTypes: ["REDD+", "Renewable Energy"],
      lastPurchase: "2023",
      netZeroTarget: "2050",
    },
    {
      id: 3,
      name: "Delta Air Lines",
      industry: "Aviation",
      volume: "12M credits",
      projectTypes: ["Forestry", "Avoided Deforestation"],
      lastPurchase: "2021",
      netZeroTarget: "2050",
    },
    {
      id: 4,
      name: "Google",
      industry: "Technology",
      volume: "Carbon neutral since 2007",
      projectTypes: ["Renewable Energy", "Forestry"],
      lastPurchase: "2023",
      netZeroTarget: "2030",
    },
    {
      id: 5,
      name: "Salesforce",
      industry: "Technology",
      volume: "Net zero by 2021",
      projectTypes: ["Carbon Removal", "Forestry"],
      lastPurchase: "2022",
      netZeroTarget: "Achieved",
    },
    {
      id: 6,
      name: "JPMorgan Chase",
      industry: "Finance",
      volume: "Carbon neutral operations",
      projectTypes: ["Forest Conservation", "Renewable Energy"],
      lastPurchase: "2023",
      netZeroTarget: "2050",
    },
    {
      id: 7,
      name: "Stripe",
      industry: "Technology",
      volume: "Frontier fund ($1B+)",
      projectTypes: ["Carbon Removal", "Direct Air Capture"],
      lastPurchase: "2023",
      netZeroTarget: "2040",
    },
  ]

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-british-navy text-white">
          <TableRow>
            <TableHead className="w-[50px] text-white">
              <Checkbox className="border-white" />
            </TableHead>
            <TableHead className="text-white">
              <Button variant="ghost" className="p-0 hover:bg-transparent text-white">
                <span>Company</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-white">Industry</TableHead>
            <TableHead className="text-white">
              <Button variant="ghost" className="p-0 hover:bg-transparent text-white">
                <span>Volume</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-white">Project Types</TableHead>
            <TableHead className="text-white">
              <Button variant="ghost" className="p-0 hover:bg-transparent text-white">
                <span>Last Purchase</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-white">Net Zero Target</TableHead>
            <TableHead className="w-[50px] text-white"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.map((buyer) => (
            <TableRow key={buyer.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium">{buyer.name}</TableCell>
              <TableCell>{buyer.industry}</TableCell>
              <TableCell>{buyer.volume}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {buyer.projectTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{buyer.lastPurchase}</TableCell>
              <TableCell>{buyer.netZeroTarget}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Star className="h-4 w-4" />
                  <span className="sr-only">Favorite</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


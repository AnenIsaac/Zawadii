"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface FilterOption {
  id: number
  field: string
  operator: "greater" | "less"
  value: string
}

interface FilterPopupProps {
  onFilter: (filters: FilterOption[]) => void
}

export function FilterPopup({ onFilter }: FilterPopupProps) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOption[]>([])
  const [customerCount, setCustomerCount] = useState(45)

  const filterFields = [
    "Amount Spent",
    "Last Visit",
    "Points",
    "Tag",
    "Reward Priority Index (RPI)",
    "Loyalty Engagement Index (LPI)",
    "Total Visits",
  ]

  const handleAddFilter = () => {
    const newFilter = {
      id: Date.now(),
      field: filterFields[0],
      operator: "greater" as const,
      value: "",
    }
    setFilters([...filters, newFilter])
  }

  const handleRemoveFilter = (id: number) => {
    setFilters(filters.filter((filter) => filter.id !== id))
  }

  const handleFilterChange = (id: number, field: keyof FilterOption, value: any) => {
    setFilters(filters.map((filter) => (filter.id === id ? { ...filter, [field]: value } : filter)))
  }

  const handleApplyFilter = () => {
    onFilter(filters)
    setOpen(false)
  }

  // Add a filter by default if there are none when opening the popup
  useEffect(() => {
    if (open && filters.length === 0) {
      handleAddFilter()
    }
  }, [open])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-orange-300 text-gray-700 hover:bg-orange-50 gap-1"
        onClick={() => setOpen(true)}
      >
        Filter <Filter className="h-4 w-4 text-orange-500" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Filter Customers</h3>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-medium">
              Customers Available: <span className="font-bold">{customerCount}</span>
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Select value={filter.field} onValueChange={(value) => handleFilterChange(filter.id, "field", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select
                    value={filter.operator}
                    onValueChange={(value: "greater" | "less") => handleFilterChange(filter.id, "operator", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater">Greater than</SelectItem>
                      <SelectItem value="less">Less than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    value={filter.value}
                    onChange={(e) => handleFilterChange(filter.id, "value", e.target.value)}
                    placeholder="Value"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-orange-100 hover:bg-orange-200"
                  onClick={() => handleRemoveFilter(filter.id)}
                >
                  <Minus className="h-4 w-4 text-orange-500" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full border border-dashed border-gray-300 text-gray-500 hover:text-orange-500 hover:border-orange-300 mb-6"
            onClick={handleAddFilter}
          >
            <Plus className="h-4 w-4 mr-2" /> Add filter
          </Button>

          <Button className="w-full bg-[#F8843A] hover:bg-[#E77A35] text-white" onClick={handleApplyFilter}>
            Filter
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

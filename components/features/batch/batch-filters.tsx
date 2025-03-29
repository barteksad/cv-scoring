"use client"

import { SortAsc, SortDesc } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FilterOptions, SortField, SortDirection } from "@/lib/types"

interface BatchFiltersProps {
  filterOptions: FilterOptions
  sortField: SortField
  sortDirection: SortDirection
  onFilterChange: (newOptions: Partial<FilterOptions>) => void
  onSortFieldChange: (field: SortField) => void
  onSortDirectionToggle: () => void
}

/**
 * Component for filtering and sorting batch processing results
 */
export function BatchFilters({
  filterOptions,
  sortField,
  sortDirection,
  onFilterChange,
  onSortFieldChange,
  onSortDirectionToggle,
}: BatchFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by filename..."
          value={filterOptions.searchTerm}
          onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
        />
      </div>

      {/* Score Filter */}
      <div className="w-full md:w-1/4">
        <Label>Filter by Score</Label>
        <Select
          value={filterOptions.scoreRange?.toString() || "all"}
          onValueChange={(value) => onFilterChange({ scoreRange: value === "all" ? null : Number(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Scores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="80">80-100% (Excellent)</SelectItem>
            <SelectItem value="60">60-80% (Good)</SelectItem>
            <SelectItem value="40">40-60% (Average)</SelectItem>
            <SelectItem value="20">20-40% (Below Average)</SelectItem>
            <SelectItem value="0">0-20% (Poor)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Options */}
      <div className="w-full md:w-1/4">
        <Label>Sort By</Label>
        <div className="flex">
          <Select value={sortField} onValueChange={(value) => onSortFieldChange(value as SortField)}>
            <SelectTrigger className="rounded-r-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="score">Score</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-l-none border-l-0" onClick={onSortDirectionToggle}>
            {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}


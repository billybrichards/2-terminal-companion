"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DirectoryFiltersProps {
  industries: string[]
  projectTypes: string[]
  selectedIndustries: string[]
  selectedProjectTypes: string[]
  setSelectedIndustries: (industries: string[]) => void
  setSelectedProjectTypes: (types: string[]) => void
  resetFilters: () => void
}

export function DirectoryFilters({
  industries,
  projectTypes,
  selectedIndustries,
  selectedProjectTypes,
  setSelectedIndustries,
  setSelectedProjectTypes,
  resetFilters,
}: DirectoryFiltersProps) {
  const [industrySearch, setIndustrySearch] = useState("")
  const [projectSearch, setProjectSearch] = useState("")

  // Handle industry selection
  const handleIndustryChange = (industry: string, checked: boolean) => {
    if (checked) {
      setSelectedIndustries([...selectedIndustries, industry])
    } else {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industry))
    }
  }

  // Handle project type selection
  const handleProjectTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedProjectTypes([...selectedProjectTypes, type])
    } else {
      setSelectedProjectTypes(selectedProjectTypes.filter((t) => t !== type))
    }
  }

  // Filter industries based on search
  const filteredIndustries = industries.filter((industry) =>
    industry.toLowerCase().includes(industrySearch.toLowerCase()),
  )

  // Filter project types based on search
  const filteredProjectTypes = projectTypes.filter((type) => type.toLowerCase().includes(projectSearch.toLowerCase()))

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["industries", "projectTypes"]} className="w-full">
        <AccordionItem value="industries">
          <AccordionTrigger>Industry</AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4">
              <div className="relative mb-3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search industries..."
                  className="pl-8 text-sm"
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {filteredIndustries.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No industries found</p>
                ) : (
                  filteredIndustries.map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={`industry-${industry}`}
                        checked={selectedIndustries.includes(industry)}
                        onCheckedChange={(checked) => handleIndustryChange(industry, checked === true)}
                      />
                      <Label htmlFor={`industry-${industry}`} className="text-sm cursor-pointer">
                        {industry}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="projectTypes">
          <AccordionTrigger>Project Types</AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4">
              <div className="relative mb-3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search project types..."
                  className="pl-8 text-sm"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {filteredProjectTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No project types found</p>
                ) : (
                  filteredProjectTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${type}`}
                        checked={selectedProjectTypes.includes(type)}
                        onCheckedChange={(checked) => handleProjectTypeChange(type, checked === true)}
                      />
                      <Label htmlFor={`project-${type}`} className="text-sm cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}


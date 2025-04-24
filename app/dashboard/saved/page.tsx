"use client"

import { useState } from "react"
import { Calendar, Download, Grid, List, MoreHorizontal, Search, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useLanguage } from "@/contexts/language-context"

// Mock data for saved tests
const savedTests = [
  {
    id: 1,
    title: "Algebra Fundamentals",
    subject: "Mathematics",
    questions: 15,
    difficulty: "Medium",
    created: new Date(2023, 2, 15),
    modified: new Date(2023, 2, 18),
    tags: ["Algebra", "Equations"],
  },
  {
    id: 2,
    title: "Cell Biology Basics",
    subject: "Science",
    questions: 20,
    difficulty: "Hard",
    created: new Date(2023, 3, 10),
    modified: new Date(2023, 3, 12),
    tags: ["Biology", "Cells"],
  },
  {
    id: 3,
    title: "Grammar and Punctuation",
    subject: "English",
    questions: 25,
    difficulty: "Easy",
    created: new Date(2023, 4, 5),
    modified: new Date(2023, 4, 5),
    tags: ["Grammar", "Writing"],
  },
  {
    id: 4,
    title: "World War II Overview",
    subject: "History",
    questions: 18,
    difficulty: "Medium",
    created: new Date(2023, 5, 20),
    modified: new Date(2023, 5, 22),
    tags: ["WWII", "20th Century"],
  },
  {
    id: 5,
    title: "JavaScript Fundamentals",
    subject: "Programming",
    questions: 30,
    difficulty: "Expert",
    created: new Date(2023, 6, 15),
    modified: new Date(2023, 6, 18),
    tags: ["JavaScript", "Web Development"],
  },
  {
    id: 6,
    title: "Chemical Reactions",
    subject: "Science",
    questions: 22,
    difficulty: "Hard",
    created: new Date(2023, 7, 10),
    modified: new Date(2023, 7, 15),
    tags: ["Chemistry", "Reactions"],
  },
]

export default function SavedTestsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const { t } = useLanguage()

  const filteredTests = savedTests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("saved.title")}</h2>
          <p className="text-muted-foreground">{t("saved.subtitle")}</p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => (window.location.href = "/dashboard/create")}>
          {t("dashboard.create")}
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="programming">Programming</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border bg-background p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <Card key={test.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1 text-lg">{test.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{test.subject}</Badge>
                  <Badge variant="outline">{test.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{test.questions} questions</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {test.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-6 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Modified {format(test.modified, "MMM d, yyyy")}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3 w-3" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Trash className="h-3 w-3" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="grid grid-cols-12 border-b bg-muted/50 px-6 py-3 text-sm font-medium">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Subject</div>
            <div className="col-span-2">Questions</div>
            <div className="col-span-2">Modified</div>
            <div className="col-span-1"></div>
          </div>
          {filteredTests.map((test) => (
            <div key={test.id} className="grid grid-cols-12 items-center border-b px-6 py-3 text-sm hover:bg-muted/50">
              <div className="col-span-5 font-medium">{test.title}</div>
              <div className="col-span-2">{test.subject}</div>
              <div className="col-span-2">{test.questions}</div>
              <div className="col-span-2">{format(test.modified, "MMM d, yyyy")}</div>
              <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Plus } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "created",
    title: "Algebra Fundamentals",
    time: "2 hours ago",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
  },
  {
    id: 2,
    type: "edited",
    title: "Cell Biology Basics",
    time: "5 hours ago",
    user: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JS",
    },
  },
  {
    id: 3,
    type: "created",
    title: "Grammar and Punctuation",
    time: "Yesterday",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
  },
  {
    id: 4,
    type: "edited",
    title: "World War II Overview",
    time: "2 days ago",
    user: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JS",
    },
  },
  {
    id: 5,
    type: "created",
    title: "JavaScript Fundamentals",
    time: "3 days ago",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              {activity.type === "created" ? "created" : "edited"} test{" "}
              <span className="font-medium">{activity.title}</span>
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                {activity.type === "created" ? (
                  <Plus className="h-3 w-3 text-primary" />
                ) : (
                  <Pencil className="h-3 w-3 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

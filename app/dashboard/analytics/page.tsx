"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { useLanguage } from "@/contexts/language-context"
import { BarChart3, LineChart, PieChart, Download, Users, CheckCircle2, FileText, Filter } from "lucide-react"

// Sample data for charts
const testData = [
  { month: "Jan", tests: 12, participants: 145 },
  { month: "Feb", tests: 19, participants: 237 },
  { month: "Mar", tests: 25, participants: 302 },
  { month: "Apr", tests: 32, participants: 408 },
  { month: "May", tests: 38, participants: 512 },
  { month: "Jun", tests: 42, participants: 606 },
  { month: "Jul", tests: 47, participants: 698 },
  { month: "Aug", tests: 53, participants: 792 },
  { month: "Sep", tests: 60, participants: 899 },
  { month: "Oct", tests: 68, participants: 1024 },
  { month: "Nov", tests: 75, participants: 1198 },
  { month: "Dec", tests: 82, participants: 1345 },
]

const subjectData = [
  { name: "Mathematics", value: 35 },
  { name: "Science", value: 25 },
  { name: "English", value: 20 },
  { name: "History", value: 10 },
  { name: "Programming", value: 10 },
]

const performanceData = [
  { name: "Excellent (90-100%)", value: 15, color: "#22c55e" },
  { name: "Good (75-89%)", value: 25, color: "#3b82f6" },
  { name: "Average (60-74%)", value: 35, color: "#eab308" },
  { name: "Below Average (40-59%)", value: 18, color: "#f97316" },
  { name: "Poor (0-39%)", value: 7, color: "#ef4444" },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    to: new Date(),
  })
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar")
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  // Translations for analytics
  const translations = {
    en: {
      title: "Analytics Dashboard",
      subtitle: "Comprehensive insights into your test performance and user engagement.",
      overview: "Overview",
      performance: "Performance",
      subjects: "Subjects",
      timeframe: "Timeframe",
      filter: "Filter",
      download: "Download Report",
      tests_created: "Tests Created",
      participants: "Participants",
      completion_rate: "Completion Rate",
      avg_score: "Average Score",
      from_last_month: "from last month",
      test_activity: "Test Activity",
      test_activity_desc: "Number of tests created and participants over time",
      performance_dist: "Performance Distribution",
      performance_dist_desc: "Distribution of test scores across all participants",
      subject_dist: "Subject Distribution",
      subject_dist_desc: "Breakdown of tests by subject area",
      recent_tests: "Recent Tests",
      view_all: "View All",
      test_name: "Test Name",
      subject: "Subject",
      participants_count: "Participants",
      avg_score_label: "Avg. Score",
      date: "Date",
    },
    ru: {
      title: "Панель аналитики",
      subtitle: "Комплексный анализ эффективности тестов и вовлеченности пользователей.",
      overview: "Обзор",
      performance: "Производительность",
      subjects: "Предметы",
      timeframe: "Временной период",
      filter: "Фильтр",
      download: "Скачать отчет",
      tests_created: "Созданные тесты",
      participants: "Участники",
      completion_rate: "Процент завершения",
      avg_score: "Средний балл",
      from_last_month: "с прошлого месяца",
      test_activity: "Активность тестирования",
      test_activity_desc: "Количество созданных тестов и участников с течением времени",
      performance_dist: "Распределение производительности",
      performance_dist_desc: "Распределение результатов тестов среди всех участников",
      subject_dist: "Распределение по предметам",
      subject_dist_desc: "Разбивка тестов по предметным областям",
      recent_tests: "Недавние тесты",
      view_all: "Посмотреть все",
      test_name: "Название теста",
      subject: "Предмет",
      participants_count: "Участники",
      avg_score_label: "Ср. балл",
      date: "Дата",
    },
    uz: {
      title: "Tahlillar paneli",
      subtitle: "Test samaradorligi va foydalanuvchilar faolligi bo'yicha keng qamrovli ma'lumotlar.",
      overview: "Umumiy ko'rinish",
      performance: "Samaradorlik",
      subjects: "Fanlar",
      timeframe: "Vaqt oralig'i",
      filter: "Filtr",
      download: "Hisobotni yuklab olish",
      tests_created: "Yaratilgan testlar",
      participants: "Ishtirokchilar",
      completion_rate: "Tugatish darajasi",
      avg_score: "O'rtacha ball",
      from_last_month: "o'tgan oydan",
      test_activity: "Test faoliyati",
      test_activity_desc: "Vaqt davomida yaratilgan testlar va ishtirokchilar soni",
      performance_dist: "Samaradorlik taqsimoti",
      performance_dist_desc: "Barcha ishtirokchilar orasida test natijalarining taqsimlanishi",
      subject_dist: "Fanlar bo'yicha taqsimot",
      subject_dist_desc: "Testlarning fan sohalari bo'yicha taqsimlanishi",
      recent_tests: "So'nggi testlar",
      view_all: "Barchasini ko'rish",
      test_name: "Test nomi",
      subject: "Fan",
      participants_count: "Ishtirokchilar",
      avg_score_label: "O'rt. ball",
      date: "Sana",
    },
  }

  // Get current language
  const lang = t("language.english") === "English" ? "en" : t("language.russian") === "Русский" ? "ru" : "uz"

  // Use translations based on current language
  const tr = translations[lang as keyof typeof translations]

  const handleExportData = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      // Create a sample CSV content
      const csvContent =
        "Month,Tests Created,Participants\n" +
        testData.map((item) => `${item.month},${item.tests},${item.participants}`).join("\n")

      // Create a Blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "analytics_report.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 1500)
  }

  // Recent tests data
  const recentTests = [
    {
      name: "Algebra Fundamentals",
      subject: "Mathematics",
      participants: 32,
      avgScore: 78,
      date: "2023-12-10",
    },
    {
      name: "Cell Biology Basics",
      subject: "Science",
      participants: 45,
      avgScore: 82,
      date: "2023-12-08",
    },
    {
      name: "Grammar and Punctuation",
      subject: "English",
      participants: 38,
      avgScore: 75,
      date: "2023-12-05",
    },
    {
      name: "World War II Overview",
      subject: "History",
      participants: 29,
      avgScore: 81,
      date: "2023-12-03",
    },
    {
      name: "JavaScript Fundamentals",
      subject: "Programming",
      participants: 24,
      avgScore: 73,
      date: "2023-11-30",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{tr.title}</h2>
          <p className="text-muted-foreground">{tr.subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">{tr.filter}</span>
            </Button>
          </div>
          <Button onClick={handleExportData} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("common.loading")}
              </div>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {tr.download}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tr.tests_created}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+22% {tr.from_last_month}</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tr.participants}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,853</div>
            <p className="text-xs text-muted-foreground">+18% {tr.from_last_month}</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tr.completion_rate}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% {tr.from_last_month}</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tr.avg_score}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+3% {tr.from_last_month}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{tr.overview}</TabsTrigger>
          <TabsTrigger value="performance">{tr.performance}</TabsTrigger>
          <TabsTrigger value="subjects">{tr.subjects}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{tr.test_activity}</CardTitle>
                  <CardDescription>{tr.test_activity_desc}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Tabs
                    value={chartType}
                    onValueChange={(value) => setChartType(value as "bar" | "line" | "area")}
                    className="w-auto"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="bar" className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Bar</span>
                      </TabsTrigger>
                      <TabsTrigger value="line" className="flex items-center gap-1">
                        <LineChart className="h-4 w-4" />
                        <span className="hidden sm:inline">Line</span>
                      </TabsTrigger>
                      <TabsTrigger value="area" className="flex items-center gap-1">
                        <PieChart className="h-4 w-4" />
                        <span className="hidden sm:inline">Area</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {/* This would be a real chart component in a production app */}
                  <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed p-4">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">
                        {chartType === "bar" && "Bar Chart"}
                        {chartType === "line" && "Line Chart"}
                        {chartType === "area" && "Area Chart"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Showing data for {testData.length} months</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>{tr.recent_tests}</CardTitle>
                <CardDescription>{tr.recent_tests}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTests.map((test, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{test.subject}</span>
                          <span>•</span>
                          <span>
                            {test.participants} {tr.participants_count.toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{test.avgScore}%</p>
                          <p className="text-xs text-muted-foreground">{tr.avg_score_label}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{new Date(test.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{tr.date}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    {tr.view_all}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tr.performance_dist}</CardTitle>
              <CardDescription>{tr.performance_dist_desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {/* This would be a real chart component in a production app */}
                <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed p-4">
                  <div className="text-center">
                    <PieChart className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Performance Distribution Chart</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {performanceData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs">
                            {item.name}: {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tr.subject_dist}</CardTitle>
              <CardDescription>{tr.subject_dist_desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {/* This would be a real chart component in a production app */}
                <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed p-4">
                  <div className="text-center">
                    <PieChart className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Subject Distribution Chart</p>
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
                      {subjectData.map((item) => (
                        <div key={item.name} className="flex flex-col items-center">
                          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-bold">{item.value}%</span>
                          </div>
                          <span className="mt-2 text-xs font-medium">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

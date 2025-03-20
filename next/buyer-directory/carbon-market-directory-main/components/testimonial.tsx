import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TestimonialProps {
  quote: string
  author: string
  role: string
  company: string
}

export function Testimonial({ quote, author, role, company }: TestimonialProps) {
  return (
    <Card className="flex flex-col h-full bg-white text-foreground">
      <CardContent className="flex-1 pt-6">
        <div className="mb-4 text-4xl text-british-red">"</div>
        <p className="text-muted-foreground mb-4">{quote}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-4 pt-4 border-t">
        <Avatar>
          <AvatarFallback className="bg-british-navy text-white">
            {author
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">
            {role}, {company}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}


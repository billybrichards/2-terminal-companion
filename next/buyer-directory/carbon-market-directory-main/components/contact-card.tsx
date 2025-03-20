import { ExternalLink, Linkedin, Mail, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ContactProps {
  contact: {
    name: string
    title: string
    email: string
    phone: string
    linkedin: string
  }
}

export function ContactCard({ contact }: ContactProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="font-medium">{contact.name}</div>
          <div className="text-sm text-muted-foreground mb-3">{contact.title}</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                {contact.email}
              </a>
            </div>
            <div className="flex items-center">
              <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <a href={`tel:${contact.phone}`} className="hover:underline">
                {contact.phone}
              </a>
            </div>
            <div className="flex items-center">
              <Linkedin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                LinkedIn Profile
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


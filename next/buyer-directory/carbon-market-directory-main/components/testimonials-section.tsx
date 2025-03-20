import { Testimonial } from "@/components/testimonial"

/**
 * Testimonials section component for the landing page
 */
export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "CarbonConnect helped us close deals 40% faster by connecting us directly with qualified buyers for our forest carbon credits.",
      author: "Sarah Johnson",
      role: "Business Development Director",
      company: "GreenForest Carbon",
    },
    {
      quote:
        "As a broker, having access to this level of market intelligence gives me a significant edge. I've identified multiple new opportunities that would have been impossible to find otherwise.",
      author: "Michael Chen",
      role: "Carbon Trading Manager",
      company: "ClimateMarket Partners",
    },
    {
      quote:
        "The benchmarking data has been invaluable for our corporate clients. We can now show them exactly how their offset strategy compares to peers in their industry.",
      author: "Emma Williams",
      role: "Senior Sustainability Consultant",
      company: "EcoStrategy Advisors",
    },
  ]

  return (
    <section id="testimonials" className="py-12 md:py-24 lg:py-32 bg-british-navy text-white">
      <div className="container">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-white">
            Trusted by Carbon Market Leaders
          </h2>
          <p className="max-w-[85%] leading-normal text-british-lightBlue sm:text-lg sm:leading-7">
            See what our customers say about how CarbonConnect has transformed their business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              company={testimonial.company}
            />
          ))}
        </div>
      </div>
    </section>
  )
}


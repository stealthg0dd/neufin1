import { Star } from "lucide-react";

export default function TestimonialSection() {
  const testimonials = [
    {
      content:
        "Neufin's sentiment analysis helped me avoid a major market downturn. The real-time insights are invaluable for making informed investment decisions.",
      author: "Sarah Johnson",
      position: "Retail Investor",
      rating: 5,
    },
    {
      content:
        "The behavioral bias analyzer was eye-opening. I didn't realize how my emotions were affecting my investment decisions until Neufin showed me the patterns.",
      author: "Michael Chen",
      position: "Portfolio Manager",
      rating: 5,
    },
    {
      content:
        "As a financial advisor, I've incorporated Neufin into my practice. The AI-powered recommendations have given my clients confidence in their investment strategies.",
      author: "Emma Rodriguez",
      position: "Financial Advisor",
      rating: 4.5,
    },
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-sentiment-positive/10 text-sentiment-positive text-sm font-medium mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Trusted by investors worldwide
          </h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-3xl mx-auto">
            Hear from our users about how Neufin has transformed their investment strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                {testimonial.rating % 1 === 0.5 && (
                  <Star className="h-4 w-4 fill-current" style={{ clipPath: "inset(0 50% 0 0)" }} />
                )}
              </div>
              <p className="text-neutral-700 mb-6">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-neutral-500">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

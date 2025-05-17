import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to transform your investment strategy?
        </h2>
        <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
          Join thousands of investors who are already leveraging AI-powered financial
          intelligence with Neufin.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-neutral-100 transition-colors"
          >
            Start free trial
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-white border-white hover:bg-white/10 transition-colors"
          >
            Schedule a demo
          </Button>
        </div>
      </div>
    </section>
  );
}

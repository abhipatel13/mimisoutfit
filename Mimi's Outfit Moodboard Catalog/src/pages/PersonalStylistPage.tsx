import { useState } from 'react';
import { Mail, Instagram, MessageCircle, Sparkles, Heart, Shirt, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

export default function PersonalStylistPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (integrate with your backend/email service later)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent! 💫",
      description: "Mimi will get back to you within 24-48 hours.",
    });

    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const services = [
    {
      icon: Sparkles,
      title: "Personal Styling",
      description: "One-on-one styling sessions tailored to your unique taste, body type, and lifestyle."
    },
    {
      icon: Shirt,
      title: "Wardrobe Consultation",
      description: "Closet audit and organization with styling tips to maximize your existing pieces."
    },
    {
      icon: Heart,
      title: "Special Occasion",
      description: "Perfect outfit curation for weddings, events, dates, or important meetings."
    },
    {
      icon: Calendar,
      title: "Seasonal Refresh",
      description: "Seasonal wardrobe updates with curated shopping lists and moodboard inspiration."
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "mimi@thelookbook.com",
      href: "mailto:mimi@thelookbook.com",
      primary: true
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@thelookbook.mimi",
      href: "https://instagram.com/thelookbook.mimi"
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "+1 (555) 123-4567",
      href: "https://wa.me/15551234567"
    }
  ];

  return (
    <>
      <SEO 
        title="Personal Styling Services | The Lookbook by Mimi"
        description="Work with Mimi for personalized styling sessions, wardrobe consultations, and curated fashion recommendations tailored to your unique style and lifestyle."
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(200,162,122,0.08),transparent_70%)]" />
          
          <div className="container-custom mobile-container py-16 sm:py-24 lg:py-32 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fadeIn">
                <Sparkles className="h-4 w-4" />
                Personal Styling Services
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 animate-fadeIn">
                Let's Create Your
                <span className="block text-accent mt-2">Signature Style</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed animate-fadeIn">
                Hi, I'm Mimi! I help people discover their unique style and build wardrobes that make them feel confident and authentic. Whether you're looking for a complete wardrobe refresh or styling for a special occasion, I'm here to guide you.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Started
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-base px-8 py-6 border-2"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Services
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 sm:py-24 bg-card">
          <div className="container-custom mobile-container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-4">
                What I Offer
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Personalized styling services designed to help you look and feel your absolute best.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="group bg-background border border-border rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:border-accent/50 transition-all hover:-translate-y-1"
                >
                  <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <service.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-primary mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Work With Me Section */}
        <section className="py-16 sm:py-24">
          <div className="container-custom mobile-container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-4">
                  Why Work With Me?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-accent to-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary mb-2">
                    Personalized Approach
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No cookie-cutter solutions. Every recommendation is tailored to you.
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-accent to-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary mb-2">
                    Years of Experience
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Trusted by hundreds of clients to elevate their everyday style.
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-accent to-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Shirt className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary mb-2">
                    Sustainable Focus
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Building timeless wardrobes that last, not fast fashion trends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="py-16 sm:py-24 bg-gradient-to-b from-background to-accent/5">
          <div className="container-custom mobile-container">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-4">
                  Let's Connect
                </h2>
                <p className="text-lg text-muted-foreground">
                  Ready to transform your wardrobe? Send me a message and let's chat about your styling needs.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Your Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Tell Me About Your Styling Needs *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="I'm looking for help with... (e.g., wardrobe refresh, special occasion styling, seasonal consultation)"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-base py-6 shadow-lg hover:shadow-xl transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-pulse">Sending...</span>
                      </>
                    ) : (
                      <>
                        Send Message
                        <Mail className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center mt-4">
                    I'll respond within 24-48 hours. Looking forward to working with you! ✨
                  </p>
                </form>
              </div>

              {/* Alternative Contact Methods */}
              <div className="mt-12">
                <p className="text-center text-sm text-muted-foreground mb-6">
                  Or reach out directly:
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {contactMethods.map((method, index) => (
                    <a
                      key={index}
                      href={method.href}
                      target={method.href.startsWith('http') ? '_blank' : undefined}
                      rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={`group flex items-center gap-3 px-5 py-3 rounded-xl border border-border hover:border-accent/50 hover:shadow-lg transition-all hover:-translate-y-0.5 ${
                        method.primary ? 'bg-accent/5' : 'bg-card'
                      }`}
                    >
                      <method.icon className={`h-5 w-5 ${method.primary ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'}`} />
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">{method.label}</div>
                        <div className="text-sm font-medium text-foreground">{method.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section (Optional) */}
        <section className="py-16 sm:py-24 bg-card">
          <div className="container-custom mobile-container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-4">
                Client Love
              </h2>
              <p className="text-lg text-muted-foreground">
                What people are saying about working with me.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "Mimi transformed my wardrobe completely! I finally feel confident in what I wear every day. Her eye for detail and understanding of my personal style is unmatched."
                </p>
                <div className="font-medium text-sm text-foreground">Sarah M.</div>
                <div className="text-xs text-muted-foreground">Marketing Executive</div>
              </div>

              <div className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "Working with Mimi was a game-changer. She helped me build a capsule wardrobe that works for both my professional and personal life. Highly recommend!"
                </p>
                <div className="font-medium text-sm text-foreground">Jessica T.</div>
                <div className="text-xs text-muted-foreground">Entrepreneur</div>
              </div>

              <div className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "Mimi's styling for my wedding events was absolutely perfect. She understood my vision and made it come to life beautifully. Thank you, Mimi!"
                </p>
                <div className="font-medium text-sm text-foreground">Priya K.</div>
                <div className="text-xs text-muted-foreground">Bride-to-be</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
          <div className="container-custom mobile-container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-accent to-primary rounded-full mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-4">
                Ready to Elevate Your Style?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let's create a wardrobe you'll love. Book your consultation today.
              </p>
              <Button 
                size="lg" 
                className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Your Style Journey
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import { Mail, Instagram, Twitter, Heart, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/SectionHeader';
import { SEO } from '@/components/SEO';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about The Lookbook by Mimi - where curated style meets effortless discovery. Discover our story, mission, and commitment to authentic fashion curation."
        url="https://thelookbookbymimi.com/about"
      />
      <div className="min-h-screen">
      <div className="container-custom section-padding">
        <SectionHeader
          title="About The Lookbook"
          subtitle="Where curated style meets effortless discovery"
          className="mb-16"
        />

        {/* Hero Story */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative group">
              <div className="aspect-[4/5] bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl overflow-hidden shadow-elegant hover-lift">
                <img
                  src="https://res.cloudinary.com/dcqlvobvk/image/upload/v1761090456/IMG-20251021-WA0003_stzp2k.jpg"
                  alt="Mimi - Fashion Curator and founder of The Lookbook, passionate about curating timeless style"
                  className="w-full h-full object-cover hover-scale"
                  loading="lazy"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10" />
            </div>
            
            <div className="space-y-6">
              <h2 className="font-display text-3xl lg:text-4xl font-medium text-primary">
                Meet Mimi
              </h2>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  With over a decade in fashion curation and styling, I founded The Lookbook 
                  to bridge the gap between inspiration and accessibility. Every piece featured 
                  here reflects my commitment to timeless elegance and contemporary relevance.
                </p>
                
                <p>
                  My journey began in the bustling fashion capitals of Paris and Milan, where I 
                  learned that true style transcends trends. It's about understanding your personal 
                  narrative and curating pieces that tell your story authentically.
                </p>
                
                <p>
                  My philosophy is simple: great style shouldn't be complicated. Through carefully 
                  curated moodboards and thoughtfully selected pieces, I help you discover looks 
                  that feel authentically you—without the overwhelm of endless scrolling.
                </p>
                
                <p>
                  From Parisian ateliers to minimalist studios, I source pieces that stand the test 
                  of time. Each collection is a narrative of modern femininity, crafted for the woman 
                  who values both style and substance.
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-gradient-to-br from-secondary/30 to-accent/10 rounded-2xl p-8 lg:p-12 mb-16 border border-accent/20 shadow-elegant">
            <h3 className="font-display text-2xl lg:text-3xl font-medium text-primary mb-6 relative inline-block">
              The Story Behind The Lookbook
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-accent rounded-full" />
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                The Lookbook by Mimi was born from a simple observation: women were spending countless 
                hours searching for outfit inspiration, only to struggle with making those looks shoppable 
                and accessible. I wanted to create a space where beautiful, cohesive aesthetics weren't 
                just aspirational—they were attainable.
              </p>
              <p>
                After years of personal styling and working with fashion enthusiasts, I noticed a pattern: 
                the most confident dressers weren't necessarily those with the biggest budgets or the latest 
                trends. They were women who understood their personal style and invested in quality pieces 
                that truly reflected who they were.
              </p>
              <p>
                This platform is my love letter to thoughtful fashion—a digital lookbook where every 
                moodboard tells a story, every piece is carefully vetted, and every look is designed to 
                inspire real-world styling. Welcome to a more intentional way of discovering fashion.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 lg:p-12 mb-16 text-center border border-primary/10 shadow-elegant relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
            <h3 className="font-display text-2xl lg:text-3xl font-medium text-primary mb-6 relative">
              Our Mission
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              To democratize access to exceptional style through thoughtful curation, 
              making beautiful fashion discoverable and shoppable for the modern woman 
              who values quality, authenticity, and effortless elegance. We believe everyone 
              deserves to feel confident in what they wear.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-6xl mx-auto mb-20">
          <h3 className="font-display text-2xl lg:text-3xl font-medium text-primary text-center mb-12">
            What We Stand For
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-110">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-display text-xl font-medium text-foreground mb-4">
                Thoughtful Curation
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Every piece is hand-selected for its quality, design philosophy, and timeless appeal. 
                No fast fashion, no fleeting trends—just pieces that deserve a place in your wardrobe.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-110">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-display text-xl font-medium text-foreground mb-4">
                Authentic Partnerships
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Transparent relationships with brands that align with our values. We only recommend 
                products we genuinely love and believe in, ensuring our community gets the best.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-110">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-display text-xl font-medium text-foreground mb-4">
                Community First
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Creating moodboards and content that spark creativity, build confidence, and foster 
                a community of women who celebrate personal style in all its forms.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h3 className="font-display text-2xl lg:text-3xl font-medium text-primary text-center mb-12">
            How The Lookbook Works
          </h3>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="font-display text-xl font-medium text-primary">1</span>
              </div>
              <div>
                <h4 className="font-display text-lg font-medium text-foreground mb-2">
                  Discover Inspiration
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Browse our curated moodboards, each telling a unique style story. From Parisian Chic 
                  to Modern Minimalist, find the aesthetic that resonates with you.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="font-display text-xl font-medium text-primary">2</span>
              </div>
              <div>
                <h4 className="font-display text-lg font-medium text-foreground mb-2">
                  Shop the Look
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Every piece in our moodboards is shoppable. Click through to purchase individual items 
                  or add entire collections to your favorites for future reference.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="font-display text-xl font-medium text-primary">3</span>
              </div>
              <div>
                <h4 className="font-display text-lg font-medium text-foreground mb-2">
                  Build Your Wardrobe
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Use our styling tips and recommendations to create a cohesive wardrobe that reflects 
                  your personal style. Quality over quantity, always.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate Transparency */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-accent/10 rounded-2xl p-8 lg:p-12 border border-accent/20">
            <h3 className="font-display text-2xl font-medium text-primary mb-4">
              A Note on Affiliate Links
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Transparency is at the heart of everything we do. The Lookbook includes affiliate links, 
                which means when you purchase through our recommendations, we may earn a small commission 
                at no extra cost to you.
              </p>
              <p>
                This support allows us to continue curating beautiful collections and providing free 
                styling inspiration to our community. However, we want to be clear: we never recommend 
                products solely for commission. Every piece featured here is something we genuinely believe 
                in and would recommend to our closest friends.
              </p>
              <p className="text-sm">
                Your trust means everything to us, and we're committed to maintaining that through honest, 
                thoughtful curation and complete transparency.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-display text-2xl lg:text-3xl font-medium text-primary mb-6">
            Let's Connect
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Have questions about a piece? Want to collaborate? Or simply want to share 
            how you've styled one of our recommendations? I'd love to hear from you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="gap-2">
              <Mail className="h-4 w-4" />
              hello@thelookbookbymimi.com
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="lg">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-8">
            Follow along for daily style inspiration, behind-the-scenes curation, and exclusive first looks at new collections.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

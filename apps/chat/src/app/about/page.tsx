export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">About</h1>
            <div className="w-16 h-px bg-border mx-auto"></div>
          </div>

          {/* Main Content */}
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <div className="space-y-8 text-lg leading-relaxed">
              <p>
                This project represents a fundamental belief: that access to artificial intelligence 
                should not be a privilege reserved for the few, but a right extended to all. 
                In an era where AI shapes our future, democratizing this technology becomes 
                not just an aspiration, but a necessity.
              </p>

              <p>
                Built as both a functional tool and a learning resource, this chat application 
                serves as a bridge between complex AI systems and everyday users. It embodies 
                the principle that powerful technology should be approachable, transparent, 
                and available to anyone seeking to understand and leverage AI capabilities.
              </p>

              <p>
                Every line of code written here carries the intention of education and empowerment. 
                Whether you're a curious beginner taking your first steps into AI, a developer 
                seeking to understand implementation patterns, or someone who simply believes 
                in the transformative potential of accessible technology—this project is for you.
              </p>

              <p>
                The open nature of this work reflects a deeper philosophy: that innovation 
                thrives in transparency, that learning accelerates through sharing, and that 
                the most profound technological advances come not from isolation, but from 
                collective understanding and contribution.
              </p>

              <p>
                This is more than a chat interface. It's a statement that the future of AI 
                should be shaped by everyone, not just a select few. It's a resource for 
                those who dare to learn, build, and imagine what's possible when barriers 
                to technology are removed.
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="pt-16 border-t border-border">
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Andres Martinez{" "}
                  <span className="text-primary">
                    &lt;andresmarpz&gt;
                  </span>
                </p>
              </div>
              
              {/* Handwritten SVG Signature */}
              <div className="flex justify-center">
                <svg
                  width="80"
                  height="40"
                  viewBox="0 0 80 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary"
                >
                  {/* A */}
                  <path
                    d="M8 32 L12 18 L16 32 M10 26 L14 26"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  
                  {/* M */}
                  <path
                    d="M24 32 L24 18 L28 25 L32 18 L32 32 M24 18 L28 25 M28 25 L32 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  
                  {/* z */}
                  <path
                    d="M44 22 L52 22 L44 30 L52 30 M48 26 L48 26"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  
                  {/* Decorative flourish */}
                  <path
                    d="M56 25 Q60 20 64 25 Q68 30 72 25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
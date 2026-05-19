import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, Shield, TrendingUp, Users, Plane } from 'lucide-react';
import logo from '@/assets/1903-aviation-logo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            {/* Logo */}
            <img 
              src={logo} 
              alt="1903 Aviation" 
              className="h-20 sm:h-28 mx-auto mb-8"
            />
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Understand the True Cost of Aircraft Ownership
            </p>
            
            <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10">
              Our interactive calculator helps you understand fixed costs, variable expenses, 
              and how charter revenue can offset your ownership costs.
            </p>

            <Button 
              size="lg" 
              onClick={() => navigate('/calculator')}
              className="gap-2 text-lg px-8 py-6 h-auto"
            >
              <Calculator className="w-5 h-5" />
              Access Calculator
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
            What You'll Discover
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Plane className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Aircraft Comparison</h3>
              <p className="text-sm text-muted-foreground">
                Compare costs across Falcon 2000 LXS, Gulfstream G550, and Global 6000
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexible Crew Config</h3>
              <p className="text-sm text-muted-foreground">
                Configure captains, first officers, cabin crew, and engineers to match your needs
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Charter Revenue</h3>
              <p className="text-sm text-muted-foreground">
                See how charter operations can significantly reduce your ownership costs
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Complete Transparency</h3>
              <p className="text-sm text-muted-foreground">
                View every line item including insurance, maintenance, Avinode, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aircraft Preview */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-4">
            Available Aircraft
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Complete 2026 budget data for each aircraft model
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Bombardier Challenger 3500', fixed: '€1.10M', variable: '€4,207', charter: '€7,000' },
              { name: 'Embraer Praetor 600', fixed: '€1.10M', variable: '€4,101', charter: '€7,000' },
            ].map((aircraft) => (
              <div 
                key={aircraft.name}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-4">{aircraft.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fixed Costs</span>
                    <span className="font-medium">{aircraft.fixed}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variable</span>
                    <span className="font-medium">{aircraft.variable}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charter Price</span>
                    <span className="font-medium">{aircraft.charter}/hour</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Calculate?
          </h2>
          <p className="text-muted-foreground mb-8">
            Access our interactive calculator to see how shared ownership and charter revenue 
            can make private aviation more accessible.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/calculator')}
            className="gap-2"
          >
            <Calculator className="w-5 h-5" />
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 1903 Aviation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

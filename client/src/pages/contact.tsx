import { NavHeader } from "@/components/nav-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact & Legal</h1>

        <Tabs defaultValue="contact">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="agreement">Agreement</TabsTrigger>
            <TabsTrigger value="survey">Survey</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Your name" />
              <Input placeholder="Your email" type="email" />
            </div>
            <Textarea placeholder="How can we help?" rows={6} />
            <Button className="rounded-xl">Send</Button>
          </TabsContent>

          <TabsContent value="terms" className="prose max-w-none">
            <h2>Terms and Conditions</h2>
            <p>By using CollaboTree, you agree to our platform rules, payment, and delivery policies.</p>
          </TabsContent>

          <TabsContent value="agreement" className="prose max-w-none">
            <h2>Service Agreement</h2>
            <p>Funds are held in admin-escrow until milestones are delivered and approved.</p>
          </TabsContent>

          <TabsContent value="survey" className="space-y-4">
            <Input placeholder="What feature would you like to see?" />
            <Textarea placeholder="Tell us more..." rows={6} />
            <Button className="rounded-xl">Submit</Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}



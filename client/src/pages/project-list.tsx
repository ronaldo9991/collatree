import { NavHeader } from "@/components/nav-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types";
import { useMemo, useState } from "react";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sort, setSort] = useState<string>("recent");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("priceRange", `0-${maxPrice}`);
    return params.toString();
  }, [search, category, maxPrice]);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects", queryString],
    queryFn: async () => {
      const response = await fetch(`/api/projects?${queryString}`, { credentials: "include" });
      return response.json();
    },
  });

  const sortedProjects = useMemo(() => {
    if (!projects) return [] as Project[];
    const copy = [...projects];
    if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
    if (sort === "eta-asc") copy.sort((a, b) => a.deliveryTime - b.deliveryTime);
    return copy;
  }, [projects, sort]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="space-y-6">
            <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Search</label>
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="mt-2" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="AI">AI/ML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Max Price: ${maxPrice}</label>
                  <div className="mt-4">
                    <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} min={50} max={5000} step={50} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Recent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="eta-asc">Delivery Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => { setSearch(""); setCategory(undefined); setMaxPrice(2000); setSort("recent"); }}>Reset</Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProjects?.map((project) => (
                <ProjectCard key={project.id} project={project} onView={(p) => (window.location.href = `/project/${p.slug}`)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



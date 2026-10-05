import Hero from "@/components/home/Hero";
import Counters from "@/components/home/Counters";
import About from "@/components/home/About";
import { WhatWeOffer, WhyChooseUs } from "@/components/home/Offer";
import Upcoming from "@/components/home/Upcoming";
import LatestProjects from "@/components/home/LatestProjects";
import Clients from "@/components/home/Clients";
import Appointment from "@/components/home/Appointment";
import Testimonials from "@/components/home/Testimonials";
import BlogSlider from "@/components/home/BlogSlider";
import {
  getBanners, getClients, getCounters, getHome, getPosts, getProjects, getSectors, getTestimonials, getUpcoming,
} from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const [banners, counters, about, service, upcoming, projects, clients, sectors, testimonials, posts] = await Promise.all([
    getBanners(), getCounters(), getHome("about"), getHome("service"), getUpcoming(), getProjects(),
    getClients(), getSectors(), getTestimonials(), getPosts(),
  ]);
  return (
    <>
      <Hero banners={banners} />
      <Counters counters={counters} />
      <About about={about} />
      <WhatWeOffer intro={service?.main_content} />
      <Upcoming projects={upcoming} />
      <LatestProjects projects={projects} />
      <WhyChooseUs />
      <Clients clients={clients} />
      <Appointment sectors={sectors} />
      <Testimonials items={testimonials} />
      <BlogSlider posts={posts} />
    </>
  );
}

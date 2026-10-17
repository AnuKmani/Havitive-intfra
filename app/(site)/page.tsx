import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo-page";
import Hero from "@/components/home/Hero";
import Counters from "@/components/home/Counters";
import About from "@/components/home/About";
import { WhatWeOffer, WhyChooseUs } from "@/components/home/Offer";
import CompletedProjects from "@/components/home/CompletedProjects";
import LatestProjects from "@/components/home/LatestProjects";
import Clients from "@/components/home/Clients";
import Appointment from "@/components/home/Appointment";
import Testimonials from "@/components/home/Testimonials";
import BlogSlider from "@/components/home/BlogSlider";
import {
  getBanners, getChooseCards, getClients, getCompletedProjects, getCounters, getHome, getOfferCards, getPosts, getProjects, getSectors, getTestimonials,
} from "@/lib/data";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("page:home");
}

export default async function HomePage() {
  const [banners, counters, about, service, offerCards, completed, completedHome, projects, clients, sectors, testimonials, posts, latestHome, chooseHome, chooseCards] = await Promise.all([
    getBanners(), getCounters(), getHome("about"), getHome("service"), getOfferCards(), getCompletedProjects(), getHome("projects"), getProjects(),
    getClients(), getSectors(), getTestimonials(), getPosts(), getHome("latest"), getHome("choose"), getChooseCards(),
  ]);
  return (
    <>
      <Hero banners={banners} />
      <Counters counters={counters} />
      <About about={about} />
      <WhatWeOffer home={service} cards={offerCards} />
      <CompletedProjects projects={completed} home={completedHome} sectors={sectors} />
      <LatestProjects projects={projects} home={latestHome} sectors={sectors} />
      <WhyChooseUs home={chooseHome} cards={chooseCards} />
      <Clients clients={clients} />
      <Appointment sectors={sectors} />
      <Testimonials items={testimonials} />
      <BlogSlider posts={posts} />
    </>
  );
}

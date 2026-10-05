export const SITE = {
  name: "Havitive Infra Pvt Ltd",
  shortName: "Havitive",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://havitive.com").replace(/\/$/, ""),
  description:
    "Havitive Infra Pvt Ltd is an architecture, engineering, construction and interior design consultancy in Thiruvananthapuram, Kerala, delivering residential, commercial, public building and infrastructure projects.",
  phones: [
    { label: "+91 999 5 320 321", tel: "+919995320321" },
    { label: "+91 9207220320", tel: "+919207220320" },
  ],
  email: "havitiveinfra@gmail.com",
  whatsapp: "https://api.whatsapp.com/send?phone=919995320321",
  address: {
    street: "Opp Infosys & UST Global, Bypass service road, Kulathoor P.O.",
    locality: "Kazhakkoottam, Thiruvananthapuram",
    region: "Kerala",
    country: "IN",
  },
  social: {
    facebook:
      "https://www.facebook.com/HavitiveArchitecturalStudio",
    youtube: "https://www.youtube.com/@havitiveinfra6253",
    instagram: "https://www.instagram.com/havitive_architectural_studio/",
  },
  video: "https://www.youtube.com/watch?v=_sI_Ps7JSEk",
} as const;

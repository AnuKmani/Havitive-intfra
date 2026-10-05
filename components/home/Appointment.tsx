import type { Sector } from "@/lib/types";
import EnquiryForm from "@/components/forms/EnquiryForm";

export default function Appointment({ sectors }: { sectors: Sector[] }) {
  return (
    <div className="space-bottom bg-title-dark overflow-hidden" id="enquiry">
      <div className="sec-bg-shape2-1 spin shape-mockup d-xl-block d-none text-white" data-bottom="9%" data-left="34%">
        <img src="/frontend/assets/img/shape/section_shape_2_1.jpg" alt="" />
      </div>
      <div className="sec-bg-shape2-2 wave-anim shape-mockup d-xl-block d-none text-white" data-top="19%" data-left="12%" data-bg-src="/frontend/assets/img/shape/section_shape_2_2.jpg"></div>
      <div className="container">
        <div className="row gx-60 align-items-center">
          <div className="col-lg-5">
            <div className="appointment-thumb text-xl-end mb-lg-0 mb-50">
              <img src="/upload/logos/havitive.jpeg" alt="Havitive office" loading="lazy" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="title-area mb-35"><h2 className="sec-title text-white">Book Business Solutions</h2></div>
            <EnquiryForm sectors={sectors.map(({ id, sector_name }) => ({ id, sector_name }))} />
          </div>
        </div>
      </div>
    </div>
  );
}

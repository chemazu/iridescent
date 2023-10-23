import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
} from "reactstrap";

import testtimonial1 from "../../images/home-page-images/testimonial/testimonial1.png";

const items = [
  {
    id: 1,
    username: "KaganTech",
    role: "Content creator",
    testimony: "Tuturly is really great, they helped me pay my house rent.",
    img: testtimonial1,
  },
  {
    id: 2,
    username: "Deba",
    role: "Cheif Technology Officer",
    testimony:
      "Speechless! Speechless!!. Thats how it makes me feel.. When i use it, i fall in love",
    img: testtimonial1,
  },
  {
    id: 3,
    username: "Benedict",
    role: "Podcaster",
    testimony:
      "A platform, unlike any other... A platform, unlike any other... A platform, unlike any other...",
    img: testtimonial1,
  },
  {
    id: 4,
    username: "Kolawole",
    role: "Developer",
    testimony:
      "WoW!!! A platform, unlike any other... A platform, unlike any other...",
    img: testtimonial1,
  },
];

const Testimonial = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const slides = items.map((item) => {
    return (
      <CarouselItem
        className="testimonial-carousel-custom-tag"
        tag="div"
        key={item.id}
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
      >
        <div className="testimony-item">
          <div className="testimonial-custom-tag-user-info">
            <div className="testimonial-user-img">
              <img src={item.img} className="img-fluid" alt="..." />
            </div>
            <div className="testimonial-user-details">
              <div className="testimonial-username">{item.username}</div>
              <div className="testimonial-role">{item.role}</div>
            </div>
          </div>
          <hr className="testimony-hr" />
          <div className="text-center testimonial-testimony">
            {item.testimony}
          </div>
        </div>
      </CarouselItem>
    );
  });

  return (
    <section className="testimonial-section">
      <Container className="testimonial-section__container">
        <h2>
          Join other professionals and artisans who are already making a living
          by sharing their knowledge!
        </h2>
        <Row className="mt-3 align-items-center">
          <Col onClick={previous} className="testimonial-navigator-item" md="2">
            <div className="testimonial-navigator">
              <i className="fas fa-chevron-left"></i>
            </div>
          </Col>
          <Col md="8" className="mx-auto">
            <div className="testimonial-carousel-container">
              <Carousel
                activeIndex={activeIndex}
                next={next}
                previous={previous}
                items={items}
              >
                <CarouselIndicators
                  items={items}
                  activeIndex={activeIndex}
                  onClickHandler={goToIndex}
                />
                {slides}
                <CarouselControl
                  direction="prev"
                  directionText="Previous"
                  onClickHandler={previous}
                />
                <CarouselControl
                  direction="next"
                  directionText="Next"
                  onClickHandler={next}
                />
              </Carousel>
            </div>
          </Col>
          <Col onClick={next} className="testimonial-navigator-item" md="2">
            <div className="testimonial-navigator">
              <i class="fas fa-chevron-right"></i>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Testimonial;

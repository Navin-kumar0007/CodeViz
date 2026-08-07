import { PhoneCarousel } from './phone-mockups-1-utils/phoneCarousel';

/**
 * @typedef {import('./phone-mockups-1-utils/phoneCarousel').ImageItem} ImageItem
 */

/** @type {ImageItem[]} */
const exampleImages = [
  { src: 'https://res.cloudinary.com/harshitproject/image/upload/v1746774805/Behance-screen.png', alt: 'Behance app on iPhone' },
  { src: 'https://res.cloudinary.com/harshitproject/image/upload/v1746774805/Notion-screen.png', alt: 'Notion app on iPhone' },
  { src: 'https://res.cloudinary.com/harshitproject/image/upload/v1746774806/One-screen.png', alt: 'One app on iPhone' },
  { src: 'https://res.cloudinary.com/harshitproject/image/upload/v1746774807/Reddit-nj7hwh.png', alt: 'Reddit app on iPhone' },
];

export default function PhoneMockupBasic() {
  return <PhoneCarousel images={exampleImages} />;
}

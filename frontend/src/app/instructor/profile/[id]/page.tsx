/**
 * STUDENT HOME PAGE
 *
 * Requires:
 * - Search Bar
 *   - Search Type Dropdown
 *     - Subject
 *     - Name
 *   - Input Field
 *   - Search Button
 * - Session Cards
 *   - Tutor Name
 *   - Tutor Image(?)
 *   - Tutor Rating
 *   - Subject
 *   - Description
 *   - Meeting Button / Link(?) -- "1 hour"
 *
 * Additional Notes:
 * - After meeting, redirect to student review
 *
 */

import {
  Avatar,
  BackgroundImage,
  Group,
  Pill,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { ProfileTabs } from "./ProfileTabs";

const data = [
  {
    name: "John Doe",
    profileImage:
      "https://avatars0.githubusercontent.com/u/9919?s=460&amp;u=1a69d6d0baedc5a3a3a3a3a3a3a3a3a3a3a3a3a&amp;v=4",
    subjects: ["Biology", "Chemistry"],
    rating: 4.5,
    description:
      "Experienced biology tutor with a passion for helping students understand complex concepts.",
    reviews: [
      {
        username: "JaneSmith",
        rating: 4,
        content: "Great tutor, really helped me understand the material!",
      },
      {
        username: "BobJohnson",
        rating: 5,
        content: "Very knowledgeable and patient. Highly recommend!",
      },
      {
        username: "AliceWilliams",
        rating: 4,
        content: "Good tutor, but sometimes late to sessions.",
      },
      {
        username: "CharlieBrown",
        rating: 3,
        content: "Okay tutor, but I found someone better.",
      },
      {
        username: "LucyLi",
        rating: 5,
        content: "Amazing tutor! Made biology easy to understand.",
      }
    ],
    sessions: [
      {
        name: "Biology 101",
        description: "Introduction to Biology",
        subject: "Biology",
        time: new Date(),
      },
      {
        name: "Chemistry 101",
        description: "Introduction to Chemistry",
        subject: "Chemistry",
        time: new Date(),
      },
    ],
  },
];

export default async function Page({ params }: { params: { id: string } }) {
  const instructor = data[Number.parseInt(params.id)];

  return (
    <section>
      <Stack>
        <BackgroundImage
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-6.png"
          h={128}
        />
        <Group className="relative" px={128}>
          <Avatar
            className="absolute -top-16 bg-white shadow-lg"
            src=""
            size={256}
          />
          <Stack justify="flex-start" className="">
            <Title>{instructor.name}</Title>
            <Text>{instructor.description}</Text>
            <Group>
              {instructor.subjects.map((subject, i) => (
                <Pill className="w-fit" key={i}>
                  <Link href={`/search?subject=${subject.toLowerCase()}`}>
                    {subject.toUpperCase()}
                  </Link>
                </Pill>
              ))}
            </Group>
          </Stack>
        </Group>
        <ProfileTabs instructor={instructor} />
      </Stack>
    </section>
  );
}

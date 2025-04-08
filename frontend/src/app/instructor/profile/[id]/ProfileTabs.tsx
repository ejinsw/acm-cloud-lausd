"use client";

import { Group, Tabs } from "@mantine/core";
import { Review } from "./Review";
import { Session } from "./Session";

interface Props {
  className?: string;
  instructor: {
    reviews: { username: string; rating: number; content: string }[];
    sessions: {
      name: string;
      description: string;
      subject: string;
      time: Date;
    }[];
  };
}

export function ProfileTabs({ instructor }: Props) {
  return (
    <Tabs defaultValue={"sessions"}>
      <Tabs.List>
        <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
        <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel my={24} value="sessions">
        <Group wrap={"wrap"}>
          {instructor.sessions.map((session, i) => (
            <Session session={session} key={i} />
          ))}
        </Group>
      </Tabs.Panel>
      <Tabs.Panel my={24} value="reviews">
        <Group wrap={"wrap"}>
          {instructor.reviews.map((review, i) => (
            <Review review={review} key={i} />
          ))}
        </Group>
      </Tabs.Panel>
    </Tabs>
  );
}

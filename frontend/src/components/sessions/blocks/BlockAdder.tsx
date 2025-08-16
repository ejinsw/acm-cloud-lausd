import { useState } from "react";
import { Paper, Text, Button, Menu, Box, Stack } from "@mantine/core";
import { Plus, BookOpen, Upload, Tag } from "lucide-react";

interface BlockAdderProps {
  onAddBlock: (blockType: string) => void;
  existingBlocks: string[];
}

const availableBlocks = [
  {
    type: "prerequisites",
    label: "Prerequisites",
    description: "What students should know before joining",
    icon: BookOpen,
    color: "teal"
  },
  {
    type: "materials",
    label: "Materials & Resources",
    description: "What students need to bring or access",
    icon: Upload,
    color: "cyan"
  },
  {
    type: "topics",
    label: "Topics Covered",
    description: "Specific topics and concepts",
    icon: Tag,
    color: "grape"
  },
  {
    type: "tags",
    label: "Session Tags",
    description: "Keywords to help students find your session",
    icon: Tag,
    color: "lime"
  }
];

export function BlockAdder({ onAddBlock, existingBlocks }: BlockAdderProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out blocks that already exist
  const availableBlocksToAdd = availableBlocks.filter(
    block => !existingBlocks?.includes(block.type)
  );

  if (availableBlocksToAdd.length === 0) {
    return (
      <Paper p="xl" radius="lg" withBorder bg="gray.1" style={{ borderStyle: 'dashed' }}>
        <Box ta="center">
          <Text size="lg" c="dimmed" fw={500}>
            All available blocks have been added! 🎉
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            Your session is complete with all the content blocks.
          </Text>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper p="xl" radius="lg" withBorder bg="gray.1" style={{ borderStyle: 'dashed' }}>
      <Stack align="center" gap="md">
        <Menu 
          opened={isOpen} 
          onChange={setIsOpen}
          position="bottom"
          shadow="md"
          width={350}
        >
          <Menu.Target>
            <Button 
              variant="light" 
              size="lg" 
              leftSection={<Plus size={18} />}
              onClick={() => setIsOpen(!isOpen)}
              color="blue"
            >
              Add New Block
            </Button>
          </Menu.Target>
          
          <Menu.Dropdown>
            <Menu.Label>Choose content to add</Menu.Label>
            {availableBlocksToAdd.map((block) => {
              const IconComponent = block.icon;
              return (
                <Menu.Item
                  key={block.type}
                  leftSection={<IconComponent size={16} />}
                  onClick={() => {
                    onAddBlock(block.type);
                    setIsOpen(false);
                  }}
                >
                  <Box>
                    <Text fw={500} size="sm">{block.label}</Text>
                    <Text size="xs" c="dimmed" lineClamp={2}>{block.description}</Text>
                  </Box>
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
        
        <Text size="sm" c="dimmed" ta="center">
          {availableBlocksToAdd.length} block{availableBlocksToAdd.length !== 1 ? 's' : ''} available to add
        </Text>
      </Stack>
    </Paper>
  );
}

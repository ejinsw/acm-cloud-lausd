"use client";

import { Group, Select, TextInput, Button, Stack } from '@mantine/core';
import { Search } from 'lucide-react';
import { useState } from "react";

export interface SearchParams {
  query: string;
  searchBy: 'session' | 'instructor';
}

interface SearchBarProps {
  className?: string;
  onSearch: (params: SearchParams) => void;
  initialParams?: Partial<SearchParams>;
}

export function SearchBar({ 
  className, 
  onSearch,
  initialParams = {}
}: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    searchBy: 'session',
    ...initialParams
  });

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const updateParams = <T extends keyof SearchParams>(key: T, value: SearchParams[T]) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Stack className={className} gap="xs">
      <Group wrap="nowrap">
          <Select
            w={150}
            value={searchParams.searchBy}
            onChange={(value) => {
              if (value === 'session' || value === 'instructor') {
                updateParams('searchBy', value);
              }
            }}
            data={[
              { value: 'session', label: 'Session' },
              { value: 'instructor', label: 'Instructor' },
            ]}
          />
        
        <TextInput
          placeholder={`Search ${searchParams.searchBy ? `by ${searchParams.searchBy}` : ''}...`}
          value={searchParams.query}
          leftSection={<Search size={16} />}
          onChange={(e) => updateParams('query', e.target.value)}
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        
        <Button onClick={handleSearch}>
          Search
        </Button>
      </Group>
    </Stack>
  );
} 
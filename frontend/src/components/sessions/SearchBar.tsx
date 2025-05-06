"use client";

import { Group, Select, TextInput, Button, RangeSlider, MultiSelect, Box, Stack } from '@mantine/core';
import { Search } from 'lucide-react';
import { useState } from "react";

export interface SearchParams {
  query: string;
  searchBy: 'name' | 'subject' | 'description';
  subjects?: string[];
  priceRange?: [number, number];
  sortBy?: 'rating' | 'price' | 'date';
  sortDirection?: 'asc' | 'desc';
}

interface SearchBarProps {
  className?: string;
  variant?: 'simple' | 'advanced';
  subjectOptions?: { value: string; label: string; }[];
  onSearch: (params: SearchParams) => void;
  initialParams?: Partial<SearchParams>;
}

export function SearchBar({ 
  className, 
  variant = 'simple',
  subjectOptions = [],
  onSearch,
  initialParams = {}
}: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    searchBy: 'subject',
    ...initialParams
  });
  
  const [showAdvanced, setShowAdvanced] = useState(variant === 'advanced');

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const updateParams = <T extends keyof SearchParams>(key: T, value: SearchParams[T]) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Stack className={className} gap="xs">
      <Group wrap="nowrap">
        {variant === 'advanced' && (
          <Select
            w={150}
            value={searchParams.searchBy}
            onChange={(value) => {
              if (value === 'subject' || value === 'name' || value === 'description') {
                updateParams('searchBy', value);
              }
            }}
            data={[
              { value: 'subject', label: 'Subject' },
              { value: 'name', label: 'Instructor Name' },
              { value: 'description', label: 'Description' }
            ]}
          />
        )}
        
        <TextInput
          placeholder={`Search ${variant === 'advanced' && searchParams.searchBy ? `by ${searchParams.searchBy}` : ''}...`}
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
        
        {variant === 'advanced' && (
          <Button 
            variant="subtle" 
            onClick={() => setShowAdvanced(prev => !prev)}
          >
            {showAdvanced ? 'Hide Filters' : 'Show Filters'}
          </Button>
        )}
      </Group>
      
      {variant === 'advanced' && showAdvanced && (
        <Box mt="xs">
          <Group align="flex-start">
            {subjectOptions.length > 0 && (
              <MultiSelect
                label="Subjects"
                placeholder="Select subjects"
                data={subjectOptions}
                value={searchParams.subjects || []}
                onChange={(value) => updateParams('subjects', value)}
                style={{ flex: 1 }}
                clearable
              />
            )}
            
            <Box style={{ flex: 1 }}>
              <Group mb={5}>
                <span>Price Range</span>
                {searchParams.priceRange && (
                  <span>${searchParams.priceRange[0]} - ${searchParams.priceRange[1]}</span>
                )}
              </Group>
              <RangeSlider
                min={0}
                max={100}
                step={5}
                value={searchParams.priceRange || [0, 100]}
                onChange={(value) => updateParams('priceRange', value)}
                label={(value) => `$${value}`}
              />
            </Box>
            
            <Select
              label="Sort By"
              data={[
                { value: 'rating', label: 'Rating' },
                { value: 'price', label: 'Price' },
                { value: 'date', label: 'Date' }
              ]}
              value={searchParams.sortBy}
              onChange={(value) => {
                const sortValue = value as SearchParams['sortBy'];
                updateParams('sortBy', sortValue);
              }}
              style={{ width: 150 }}
              clearable
            />
            
            <Select
              label="Order"
              data={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' }
              ]}
              value={searchParams.sortDirection}
              onChange={(value) => {
                const directionValue = value as SearchParams['sortDirection'];
                updateParams('sortDirection', directionValue);
              }}
              style={{ width: 150 }}
              clearable
            />
          </Group>
        </Box>
      )}
    </Stack>
  );
} 
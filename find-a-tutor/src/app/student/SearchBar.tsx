"use client";

import { Group, Select, TextInput, Button } from '@mantine/core';
import { useState } from "react";

// Define the component's props interface
interface Props {
  className?: string; 
  onSearch: (params: SearchParams) => void; 
}

/**
 * SearchBar Component
 * A reusable search component that allows users to search by either subject, name, or university.
 * Features:
 * - Dropdown to select search type (subject/name/university)
 * - Search input field with dynamic placeholder
 * - Search can be triggered via button click or Enter key
 */
export interface SearchParams {
  query: string;
  searchType: 'subject' | 'name' ;
}

export function SearchBar({ className, onSearch }: Props) {
  // State for tracking the search parameters
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    searchType: 'subject'
  });

  const handleSearch = () => {
    onSearch(searchParams);
  };

  return (
    <Group className={className} gap="md" wrap="nowrap">
      {/* dynamic search type */}
      <Select
        w={200}
        value={searchParams.searchType}
        onChange={(value) => setSearchParams(prev => ({ ...prev, searchType: value as SearchParams['searchType'] }))}
        data={[
          { value: 'subject', label: 'Subject' },
          { value: 'name', label: 'Tutor Name' },
        ]}
      />
      
      {/* search input field*/}
      <TextInput
        placeholder={`Search by ${searchParams.searchType}...`}
        value={searchParams.query}
        onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
        style={{ flex: 1 }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />
      
      {/* search button */}
      <Button onClick={handleSearch}>
        Search
      </Button>
    </Group>
  );
}

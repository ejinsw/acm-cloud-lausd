import React, { useEffect, useState } from "react";

interface SchoolRecord {
  name: string;
}

interface ApiResponse {
  results: SchoolRecord[];
  total_count: number;
}

interface AllSchoolsDropdownProps {
  onChange: (value: string) => void;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch with retry
async function fetchWithRetry(url: string, retries = 3, delayMs = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      
      // If we get a 429 (Too Many Requests) or 400, wait longer
      if (response.status === 429 || response.status === 400) {
        await delay(delayMs * (i + 1)); // Exponential backoff
        continue;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(delayMs * (i + 1));
    }
  }
  throw new Error('Max retries reached');
}

// Helper function to fetch a batch of pages
async function fetchBatch(startPage: number, batchSize: number, totalPages: number) {
  const fetches = [];
  const endPage = Math.min(startPage + batchSize, totalPages);

  for (let i = startPage; i < endPage; i++) {
    const url = `${baseUrl}?limit=100&offset=${i * 100}`;
    fetches.push(
      fetchWithRetry(url)
        .then(res => res.json())
        .then(data => {
          if (!data.results || !Array.isArray(data.results)) {
            throw new Error('Invalid API response format');
          }
          return data.results
            .filter((record: SchoolRecord) => record.name)
            .map((record: SchoolRecord) => record.name);
        })
    );
  }

  return Promise.all(fetches);
}

const baseUrl = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/us-public-schools/records";
const CACHE_KEY = 'schools_list_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const AllSchoolsDropdown = ({ onChange }: AllSchoolsDropdownProps) => {
  const [schools, setSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchAllSchools() {
      try {
        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { schools: cachedSchools, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            console.log('Using cached schools data');
            setSchools(cachedSchools);
            setLoading(false);
            return;
          }
        }

        console.log('Starting to fetch schools...');
        let allSchools: string[] = [];
        const BATCH_SIZE = 2; // Reduced batch size
        const DELAY_BETWEEN_BATCHES = 2000; // 2 second delay between batches

        // First request to get total count
        const initialUrl = `${baseUrl}?limit=100`;
        const initialRes = await fetchWithRetry(initialUrl);
        const initialData = await initialRes.json() as ApiResponse;
        const totalCount = initialData.total_count;
        const totalPages = Math.ceil(totalCount / 100);
        console.log(`Total schools to fetch: ${totalCount} (${totalPages} pages)`);

        // Add initial schools from first request
        const initialSchools = initialData.results
          .filter((record: SchoolRecord) => record.name)
          .map((record: SchoolRecord) => record.name);
        allSchools = [...initialSchools];

        // Fetch remaining pages in batches
        for (let startPage = 1; startPage < totalPages; startPage += BATCH_SIZE) {
          if (!isMounted) break;

          console.log(`Fetching batch starting at page ${startPage}...`);
          const batchResults = await fetchBatch(startPage, BATCH_SIZE, totalPages);
          const newSchools = batchResults.flat();
          allSchools = [...allSchools, ...newSchools];

          // Update progress
          const newProgress = Math.min(100, Math.round((startPage + BATCH_SIZE) / totalPages * 100));
          setProgress(newProgress);

          // Add delay between batches to avoid rate limiting
          if (startPage + BATCH_SIZE < totalPages) {
            await delay(DELAY_BETWEEN_BATCHES);
          }
        }

        if (isMounted) {
          console.log(`Successfully loaded ${allSchools.length} schools`);
          // Cache the results
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            schools: allSchools,
            timestamp: Date.now()
          }));
          setSchools(allSchools);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching schools:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      }
    }

    fetchAllSchools();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <select disabled className="w-full p-2 border rounded">
          <option>Loading schools... {progress}%</option>
        </select>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Loading schools... {progress}% complete
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-2 border border-red-300 rounded">
        Error loading schools: {error}
      </div>
    );
  }

  return (
    <select 
      onChange={(e) => onChange && onChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">Select a school</option>
      {schools.map((name, idx) => (
        <option key={idx} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default AllSchoolsDropdown;

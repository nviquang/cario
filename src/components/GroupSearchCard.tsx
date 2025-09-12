import { useState, useRef, useEffect } from 'react';

interface GroupSearchCardProps {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
}

export const GroupSearchCard: React.FC<GroupSearchCardProps> = ({
  onSearch,
  isLoading,
}) => {
  const [query, setQuery] = useState('');

  // ensure we always call the latest onSearch
  const latestOnSearch = useRef(onSearch);
  useEffect(() => {
    latestOnSearch.current = onSearch;
  }, [onSearch]);

  const debounceDelay = 300; // ms

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // only update local state here
    setQuery(e.target.value);
  };

  // Keep references to these values so TS/lint don't complain while the input
  // is temporarily hidden. No runtime effect.
  void isLoading;
  void handleSearchChange;

  // debounce the API call when `query` changes
  useEffect(() => {
    const id = window.setTimeout(() => {
      // call the latest onSearch with the current query value
      latestOnSearch.current(query);
    }, debounceDelay);

    return () => {
      window.clearTimeout(id);
    };
  }, [query]);

  return (
    <div className="search-card">
      <input
        type="text"
        className="search-input"
        placeholder="Tìm kiếm nhóm..."
        value={query}
        onChange={handleSearchChange}
        disabled={isLoading}
        aria-label="Tìm kiếm nhóm"
      />
    </div>
  );
};

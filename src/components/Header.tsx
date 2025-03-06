import React, { useState } from 'react';

interface HeaderProps {
  onQuerySubmit: (query: string) => void;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onQuerySubmit, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onQuerySubmit(query);
    }
  };

  return (
    <header className="bg-gray-800 p-4 border-b border-gray-700">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold text-white">Muze Studio AI</h1>
          
          <form onSubmit={handleSubmit} className="flex-1 flex max-w-3xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the chart you want to create..."
              className="flex-1 px-4 py-2 rounded-l bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-r bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Chart'}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header; 
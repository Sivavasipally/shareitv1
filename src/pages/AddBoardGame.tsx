import React, { useState } from 'react';
import { ArrowLeft, Upload, Plus, MinusCircle } from 'lucide-react';

const AddBoardGame: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    designer: '',
    minPlayers: '',
    maxPlayers: '',
    playTime: '',
    complexity: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process form data
    console.log('Submitted:', formData);
    // Reset form
    setFormData({
      title: '',
      designer: '',
      minPlayers: '',
      maxPlayers: '',
      playTime: '',
      complexity: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button 
          className="mr-4 p-2 text-gray-500 hover:text-blue-800 rounded-full hover:bg-gray-100 transition-colors" 
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Board Game</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Game Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter game title"
                />
              </div>
              
              <div>
                <label htmlFor="designer" className="block text-sm font-medium text-gray-700 mb-1">
                  Designer*
                </label>
                <input
                  type="text"
                  id="designer"
                  name="designer"
                  value={formData.designer}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter designer name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minPlayers" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Players
                  </label>
                  <input
                    type="number"
                    id="minPlayers"
                    name="minPlayers"
                    value={formData.minPlayers}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Players
                  </label>
                  <input
                    type="number"
                    id="maxPlayers"
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="playTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Play Time (minutes)
                  </label>
                  <input
                    type="text"
                    id="playTime"
                    name="playTime"
                    value={formData.playTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 30-60"
                  />
                </div>
                
                <div>
                  <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-1">
                    Complexity
                  </label>
                  <select
                    id="complexity"
                    name="complexity"
                    value={formData.complexity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select complexity</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter game description"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Game Box Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center h-48">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      Drag and drop an image file here, or click to select a file
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                  />
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Select file
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Components
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Game board"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <MinusCircle size={18} />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Player tokens"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <MinusCircle size={18} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex items-center text-blue-800 hover:text-blue-900"
                  >
                    <Plus size={16} className="mr-1" />
                    Add component
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                <div className="flex flex-wrap items-center border border-gray-300 rounded-md p-2">
                  <div className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                    Strategy
                    <button type="button" className="ml-1 focus:outline-none">
                      &times;
                    </button>
                  </div>
                  <div className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                    Family
                    <button type="button" className="ml-1 focus:outline-none">
                      &times;
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex items-center text-gray-500 hover:text-blue-800 mb-2"
                  >
                    <Plus size={16} className="mr-1" />
                    Add category
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Add Board Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBoardGame;
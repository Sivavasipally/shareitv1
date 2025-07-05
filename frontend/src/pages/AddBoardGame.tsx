import React, { useState } from 'react';
import { ArrowLeft, Upload, Plus, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const AddBoardGame: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    designer: '',
    min_players: '',
    max_players: '',
    play_time: '',
    complexity: '',
    description: '',
    image_url: '',
    categories: [] as string[],
    components: [] as string[]
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [componentInput, setComponentInput] = useState('');

  const complexityOptions = ['Easy', 'Medium', 'Hard'];

  const commonCategories = [
    'Strategy', 'Family', 'Party', 'Abstract', 'Thematic',
    'War', 'Economic', 'Card Game', 'Dice', 'Miniatures',
    'Cooperative', 'Deck Building', 'Area Control', 'Worker Placement',
    'Tile Placement', 'Roll and Write', 'Trivia', 'Word Game',
    'Dexterity', 'Children', 'Educational'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData(prev => ({ ...prev, categories: [...prev.categories, categoryInput.trim()] }));
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }));
  };

  const handleAddComponent = () => {
    if (componentInput.trim() && !formData.components.includes(componentInput.trim())) {
      setFormData(prev => ({ ...prev, components: [...prev.components, componentInput.trim()] }));
      setComponentInput('');
    }
  };

  const handleRemoveComponent = (componentToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp !== componentToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const gameData = {
        title: formData.title,
        designer: formData.designer || null,
        min_players: formData.min_players ? parseInt(formData.min_players) : null,
        max_players: formData.max_players ? parseInt(formData.max_players) : null,
        play_time: formData.play_time || null,
        complexity: formData.complexity || null,
        description: formData.description || null,
        image_url: formData.image_url || null,
        categories: formData.categories,
        components: formData.components
      };

      // Validate min/max players
      if (gameData.min_players && gameData.max_players && gameData.min_players > gameData.max_players) {
        alert('Minimum players cannot be greater than maximum players');
        return;
      }

      await apiService.createBoardGame(gameData);

      alert('Board game added successfully!');
      navigate('/boardgames');
    } catch (error: any) {
      console.error('Error creating board game:', error);
      alert(error.response?.data?.detail || 'Failed to add board game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/boardgames');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/boardgames')}
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
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="designer" className="block text-sm font-medium text-gray-700 mb-1">
                  Designer
                </label>
                <input
                  type="text"
                  id="designer"
                  name="designer"
                  value={formData.designer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter designer name"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min_players" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Players
                  </label>
                  <input
                    type="number"
                    id="min_players"
                    name="min_players"
                    value={formData.min_players}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="max_players" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Players
                  </label>
                  <input
                    type="number"
                    id="max_players"
                    name="max_players"
                    value={formData.max_players}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="play_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Play Time
                  </label>
                  <input
                    type="text"
                    id="play_time"
                    name="play_time"
                    value={formData.play_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 30-60 min"
                    disabled={loading}
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
                    disabled={loading}
                  >
                    <option value="">Select complexity</option>
                    {complexityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Game Box Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/game-image.jpg"
                  disabled={loading}
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Game preview"
                      className="w-32 h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="">Select or type category</option>
                    {commonCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading || !categoryInput}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-1 focus:outline-none"
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Components
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={componentInput}
                    onChange={(e) => setComponentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComponent();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Game board, Dice, Cards"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.components.map((component, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                    >
                      <span className="text-sm">{component}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(component)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Adding Board Game...
                </>
              ) : (
                'Add Board Game'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBoardGame;
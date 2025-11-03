import { useState, useRef, useEffect } from 'react';
import './root.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [mode, setMode] = useState('generate');
  const [timeTaken, setTimeTaken] = useState(null);
  const [expandedView, setExpandedView] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [rebuildingIndex, setRebuildingIndex] = useState(false);
  const fileInputRef = useRef(null);

  const examplePrompts = [
    "A floating forest island above the clouds with glowing mushrooms",
    "Cyberpunk monks meditating beneath holographic mandalas",
    "Minimalist brutalist architecture surrounded by autumn fog",
    "A futuristic greenhouse tower growing vertical farms in space",
    "Portrait of a woman made entirely of blooming flowers and vines",
    "Surreal underwater library with books floating like jellyfish",
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setGenerationTime(prev => prev + 1);
        setProgress(prev => Math.min(prev + (100 / 85), 95));
      }, 1000);
    } else {
      setGenerationTime(0);
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setGeneratedImage(null);
    setTimeTaken(null);
    setExpandedView(true);
    setGenerationTime(0);
    setProgress(0);

    try {
      const response = await fetch('http://localhost:8000/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ prompt }),
      });

      const data = await response.json();
      setGeneratedImage(data.image_url);
      setTimeTaken(data.time_taken);
      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return;

    setLoading(true);
    setSearchResults([]);
    setTimeTaken(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/cbir/search', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setSearchResults(data.results);
      setTimeTaken(data.time_taken);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuildIndex = async () => {
    setRebuildingIndex(true);
    try {
      await fetch('http://localhost:8000/cbir/build-index', {
        method: 'POST',
      });
      alert('Index rebuilt successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to rebuild index');
    } finally {
      setRebuildingIndex(false);
    }
  };

  const downloadImage = (url, name) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8000${url}`;
    link.download = name || 'optic-core-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen bg-gray-900 text-gray-100 p-6 font-sans relative ${rebuildingIndex ? 'pointer-events-none' : ''}`}>
      {/* Rebuilding Index Overlay */}
      {rebuildingIndex && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center p-8 bg-gray-800 rounded-xl max-w-md mx-auto border border-gray-700">
            <div className="flex justify-center mb-6">
              <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">Rebuilding Visual Index</h3>
            <p className="text-gray-400">Please wait while we rebuild the visual database...</p>
          </div>
        </div>
      )}

      <header className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Optic Core Engine
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {mode === 'generate' 
            ? 'Transform your imagination into stunning visuals' 
            : 'Discover visually similar content'}
        </p>
      </header>

      <div className="flex justify-center mb-10 animate-fade-in">
        <div className="bg-gray-800 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => {
              setMode('generate');
              setExpandedView(false);
            }}
            className={`px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 ${
              mode === 'generate' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white bg-transparent'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => {
              setMode('search');
              setExpandedView(false);
            }}
            className={`px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 ${
              mode === 'search' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white bg-transparent'
            }`}
          >
            Discover
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto">
        {mode === 'generate' ? (
          <div className={`
            bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 
            transition-all duration-700 overflow-hidden 
            ${expandedView ? 'flex min-h-[600px]' : 'p-8'}
          `}>
            {expandedView ? (
              <>
                <div className="w-1/2 p-8 transition-all duration-500 ease-out">
                  <form onSubmit={handleGenerate} className="space-y-8">
                    <div>
                      <label htmlFor="prompt" className="block text-xl text-gray-300 mb-4 font-medium">
                        Describe your vision
                      </label>
                      <input
                        id="prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A futuristic cityscape at dusk with flying cars..."
                        className="w-full px-6 py-4 text-xl rounded-xl bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-500 transition-all shadow-inner"
                      />
                      <div className="mt-4 flex flex-wrap gap-3">
                        {examplePrompts.map((example, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setPrompt(example)}
                            className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 transition-all duration-300 text-gray-300 hover:text-white"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim()}
                      className={`
                        w-full py-4 px-6 rounded-xl font-bold text-lg 
                        transition-all duration-500 shadow-lg 
                        ${loading || !prompt.trim() 
                          ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transform hover:scale-[1.02]'
                        }
                      `}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </span>
                      ) : 'Create Image'}
                    </button>
                  </form>

                  {loading && (
                    <div className="mt-10 space-y-6">
                      <div className="flex justify-between text-lg text-gray-400">
                        <span>Progress</span>
                        <span>{generationTime}s</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`
                  w-1/2 p-8 border-l border-gray-700 
                  transition-all duration-700 ease-in-out 
                  ${expandedView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
                `}>
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-300">Your Creation</h2>
                      {timeTaken && (
                        <span className="text-lg text-gray-400">
                          Completed in {timeTaken}s
                        </span>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-xl border border-gray-600 overflow-hidden transition-all duration-500 hover:border-blue-500">
                      {loading ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                          <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
                            <div className="absolute inset-6 rounded-full bg-gray-800 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-300 mb-3">Crafting Your Vision</h3>
                          <p className="text-gray-500">This usually takes about {generationTime < 30 ? 'a minute' : 'a moment'}...</p>
                        </div>
                      ) : generatedImage ? (
                        <div className="relative h-full group">
                          <img
                            src={`http://localhost:8000${generatedImage}`}
                            alt="Generated from prompt"
                            className="w-full h-full object-contain p-8 transition-transform duration-1000 group-hover:scale-105"
                          />
                          <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex space-x-3">
                            <button
                              onClick={() => downloadImage(generatedImage, `optic-core-${prompt.substring(0, 20)}`)}
                              className="p-3.5 bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-110"
                              title="Download"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                          <div className="w-24 h-24 bg-gray-600 rounded-2xl flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl text-gray-400 mb-2">Visual Preview</h3>
                          <p className="text-gray-600">Your generated image will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-8">
                <div>
                  <label htmlFor="prompt" className="block text-xl text-gray-300 mb-4 font-medium">
                    Describe your vision
                  </label>
                  <input
                    id="prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A futuristic cityscape at dusk with flying cars..."
                    className="w-full px-6 py-4 text-xl rounded-xl bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-500 transition-all shadow-inner"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setPrompt(example)}
                        className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 transition-all duration-300 text-gray-300 hover:text-white"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className={`
                    w-full py-4 px-6 rounded-xl font-bold text-lg 
                    transition-all duration-500 shadow-lg 
                    ${loading || !prompt.trim() 
                      ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transform hover:scale-[1.02]'
                    }
                  `}
                >
                  Create Image
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 transition-all duration-500">
            <form onSubmit={handleSearch} className="space-y-8">
              <div>
                <label htmlFor="image-upload" className="block text-xl text-gray-300 mb-4 font-medium">
                  Upload Reference Image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handleSearch(e)}
                />
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 transition-all duration-500 group"
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-600 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg text-gray-300 group-hover:text-white transition-colors duration-300">
                      {fileInputRef.current?.files[0] 
                        ? fileInputRef.current.files[0].name 
                        : 'Click to upload an image'}
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG, or WEBP</p>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !fileInputRef.current?.files[0]}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg 
                  transition-all duration-500 shadow-lg 
                  ${loading || !fileInputRef.current?.files[0] 
                    ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transform hover:scale-[1.02]'
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : 'Find Visual Matches'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-10 animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-300">
                    Visual Matches
                  </h2>
                  {timeTaken && (
                    <span className="text-lg text-gray-400">
                      Analyzed in {timeTaken}s
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((result, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-xl border border-gray-700 hover:shadow-lg transition-all duration-500 aspect-square">
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                        <img
                          src={`http://localhost:8000${result}`}
                          alt={`Similar image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <div className="w-full flex justify-between items-end">
                          <span className="text-white text-base font-bold bg-gray-900/80 px-4 py-1.5 rounded-full">Match {index + 1}</span>
                          <button
                            onClick={() => downloadImage(result, `optic-core-match-${index + 1}`)}
                            className="p-3 bg-gray-900/80 hover:bg-gray-800 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                            title="Download"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && searchResults.length === 0 && (
              <div className="mt-10 flex justify-center">
                <div className="w-full h-80 bg-gray-700 rounded-xl border border-gray-600 flex flex-col items-center justify-center p-8 animate-pulse">
                  <div className="relative w-28 h-28 mb-8">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
                    <div className="absolute inset-6 rounded-full bg-gray-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-3">Analyzing Visual Patterns</h3>
                  <p className="text-gray-500">Discovering similar images...</p>
                </div>
              </div>
            )}

            {!loading && searchResults.length === 0 && (
              <div className="mt-10 text-center py-20 text-gray-500 rounded-xl border border-dashed border-gray-700 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl text-gray-400 mb-2">No Images Analyzed Yet</h3>
                <p className="text-base">Upload an image to discover visual matches</p>
              </div>
            )}

            <div className="mt-10 text-center">
              <button
                onClick={handleBuildIndex}
                disabled={rebuildingIndex}
                className={`px-6 py-3 rounded-xl transition-all duration-500 border text-base font-medium shadow-md hover:shadow-lg ${
                  rebuildingIndex
                    ? 'bg-gray-700 cursor-not-allowed text-gray-500 border-gray-600'
                    : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300'
                }`}
              >
                {rebuildingIndex ? 'Rebuilding...' : 'Rebuild Visual Index'}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-gray-500 text-base animate-fade-in">
        <p>Made with ❤️ by C_Saraswan</p>
        <p className="mt-2">Optic Core Engine — Advanced visual intelligence platform</p>
      </footer>
    </div>
  );
}

export default App;
import React, { useEffect, useState } from 'react';

// Custom Dashboard component for PayloadCMS Admin UI
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    sites: 0,
    blogPosts: 0,
    socialPosts: 0,
    bioCards: 0,
    quotes: 0,
    media: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call - in production this would fetch real data
        setTimeout(() => {
          setStats({
            sites: 3,
            blogPosts: 12,
            socialPosts: 24,
            bioCards: 8,
            quotes: 15,
            media: 36,
          });

          setRecentActivity([
            { type: 'site', title: 'Personal Portfolio', action: 'created', timestamp: '10 minutes ago' },
            { type: 'blogPost', title: 'Getting Started with PayloadCMS', action: 'updated', timestamp: '1 hour ago' },
            { type: 'socialPost', title: 'New Product Announcement', action: 'published', timestamp: '3 hours ago' },
            { type: 'quote', title: 'Inspirational Quote', action: 'created', timestamp: '1 day ago' },
          ]);

          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Activity icon map
  const getActivityIcon = (type) => {
    switch (type) {
      case 'site':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'blogPost':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'socialPost':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case 'bioCard':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        );
      case 'quote':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        );
    }
  };

  return (
    <div className="p-4">
      {/* Welcome banner */}
      <div className="p-6 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white">Welcome to One To Rule Them All CMS</h1>
        <p className="text-white opacity-90 mt-2">
          Your modern content management system for creating beautiful static websites
        </p>
        <div className="flex gap-4 mt-4">
          <button className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition">
            Create New Site
          </button>
          <button className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition">
            View Documentation
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Content Overview</h2>
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              <li className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Sites</span>
                <span className="font-semibold">{stats.sites}</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Blog Posts</span>
                <span className="font-semibold">{stats.blogPosts}</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Social Posts</span>
                <span className="font-semibold">{stats.socialPosts}</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Bio Cards</span>
                <span className="font-semibold">{stats.bioCards}</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Quotes</span>
                <span className="font-semibold">{stats.quotes}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Media</span>
                <span className="font-semibold">{stats.media}</span>
              </li>
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((activity, index) => (
                <li key={index} className="flex items-start">
                  <span className="mt-1 mr-3">{getActivityIcon(activity.type)}</span>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      <span className="capitalize">{activity.action}</span> {activity.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a 
              href="/admin/collections/sites/create" 
              className="flex items-center p-3 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Site
            </a>
            <a 
              href="/admin/collections/blog-posts/create" 
              className="flex items-center p-3 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write Blog Post
            </a>
            <a 
              href="/admin/collections/media/create" 
              className="flex items-center p-3 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Media
            </a>
            <button 
              className="flex items-center w-full p-3 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition"
              onClick={() => alert('This would generate a static site')}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Generate Static Site
            </button>
            <button 
              className="flex items-center w-full p-3 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition"
              onClick={() => alert('This would deploy to Vercel')}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Deploy to Vercel
            </button>
          </div>
        </div>
      </div>

      {/* Getting started */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1">1</div>
            <div>
              <h3 className="font-medium text-lg">Create a Site</h3>
              <p className="text-gray-600 mt-1">Start by creating a new site with your desired template and settings.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1">2</div>
            <div>
              <h3 className="font-medium text-lg">Add Content</h3>
              <p className="text-gray-600 mt-1">Create blog posts, social posts, bio cards, and quotes for your site.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1">3</div>
            <div>
              <h3 className="font-medium text-lg">Generate Static Site</h3>
              <p className="text-gray-600 mt-1">Generate a static version of your site with all your content.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1">4</div>
            <div>
              <h3 className="font-medium text-lg">Deploy to Vercel</h3>
              <p className="text-gray-600 mt-1">Deploy your static site to Vercel for fast, global hosting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';

const ViewSiteButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleViewSite = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setStatusMessage('Generating your site...');
      
      // Get the current project ID from URL if possible
      let projectId = null;
      const urlMatch = window.location.pathname.match(/\/collections\/sites\/([a-z0-9]+)/i);
      if (urlMatch && urlMatch[1]) {
        // Get projectId from the database using the ID from URL
        const res = await fetch(`/api/sites/${urlMatch[1]}`);
        if (res.ok) {
          const siteData = await res.json();
          projectId = siteData.projectId;
        }
      }
      
      if (!projectId) {
        // Try to get it from local storage or show a prompt
        projectId = localStorage.getItem('lastProjectId');
        
        if (!projectId) {
          const userInput = prompt('Please enter your project ID:');
          if (!userInput) {
            setIsLoading(false);
            setStatusMessage('');
            return;
          }
          projectId = userInput;
          localStorage.setItem('lastProjectId', projectId);
        }
      }
      
      setStatusMessage('Building your site...');
      
      // Generate the static site
      const generateResponse = await fetch('/api/generate-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, optimize: true }),
      });
      
      if (!generateResponse.ok) {
        throw new Error('Failed to generate site');
      }
      
      const generateResult = await generateResponse.json();
      
      if (!generateResult.success) {
        throw new Error(generateResult.message || 'Failed to generate site');
      }
      
      setStatusMessage('Finishing up...');
      
      // Deploy the generated site
      const deployResponse = await fetch('/api/deploy-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });
      
      if (!deployResponse.ok) {
        throw new Error('Failed to deploy site');
      }
      
      const deployResult = await deployResponse.json();
      
      if (!deployResult.success) {
        throw new Error(deployResult.message || 'Failed to deploy site');
      }
      
      setStatusMessage('Success! Opening your site...');
      
      // Get the deployment URL
      let siteUrl = null;
      if (deployResult.deployments && deployResult.deployments.length > 0) {
        const deployment = deployResult.deployments.find(d => d.success);
        if (deployment) {
          siteUrl = deployment.url;
        }
      }
      
      // Default URL if no specific deployment found
      if (!siteUrl && projectId) {
        siteUrl = `https://${projectId}.yoursite.com`;
      }
      
      // Open the site in a new tab after a short delay
      if (siteUrl) {
        setTimeout(() => {
          window.open(siteUrl, '_blank');
          
          // Reset state after a delay
          setTimeout(() => {
            setIsLoading(false);
            setStatusMessage('');
          }, 2000);
        }, 1000);
      } else {
        // Just reset the state if no URL
        setTimeout(() => {
          setIsLoading(false);
          setStatusMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error generating/deploying site:', error);
      setIsError(true);
      setStatusMessage(`Error: ${error.message || 'Something went wrong'}`);
      
      // Reset error state after a delay
      setTimeout(() => {
        setIsLoading(false);
        setStatusMessage('');
        setIsError(false);
      }, 5000);
    }
  };
  
  return (
    <div className="p-4">
      {isLoading && (
        <div className={`mb-2 p-2 rounded text-sm ${isError ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
          {statusMessage}
        </div>
      )}
      <button 
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center"
        onClick={handleViewSite}
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        View My Site
      </button>
    </div>
  );
};

export default ViewSiteButton;

import { Endpoint } from 'payload/endpoint';
import { generateStaticSite } from '../utilities/staticSiteGenerator';

/**
 * API endpoint to generate a static site
 */
const generateSiteEndpoint: Endpoint = {
  path: '/api/generate-site',
  method: 'post',
  handler: async (req, res) => {
    try {
      const { projectId, optimize = true } = req.body;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required',
        });
      }

      const result = await generateStaticSite({
        projectId,
        optimize,
      });

      return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while generating the site',
      });
    }
  },
};

export default generateSiteEndpoint;

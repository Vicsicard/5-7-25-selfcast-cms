import { Endpoint } from 'payload/endpoint';
import { deployToVercel } from '../utilities/staticSiteGenerator';

/**
 * API endpoint to deploy a site to Vercel
 */
const deploySiteEndpoint: Endpoint = {
  path: '/api/deploy-site',
  method: 'post',
  handler: async (req, res) => {
    try {
      const { projectId, token } = req.body;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required',
        });
      }

      const result = await deployToVercel({
        projectId,
        token,
      });

      return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while deploying the site',
      });
    }
  },
};

export default deploySiteEndpoint;

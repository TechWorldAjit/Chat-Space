# Chat Space - Vercel Deployment Guide

## Prerequisites
- Vercel account ([vercel.com](https://vercel.com))
- GitHub account with the repository pushed
- MongoDB Atlas instance (already configured with MONGO_URI)
- Cloudinary account (already configured)

## Deployment Steps

### 1. Deploy Backend Server First

#### Step 1.1: Push to GitHub
```bash
cd server
git add .
git commit -m "Ready for Vercel deployment"
git push -u origin main
```

#### Step 1.2: Deploy on Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Choose the `server` folder as the root directory
5. Add Environment Variables:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
   - `NODE_ENV` - Set to `production`
6. Click "Deploy"
7. **Copy the deployment URL** (e.g., `https://your-backend-project.vercel.app`)

### 2. Deploy Frontend Client

#### Step 2.1: Update Environment Variables
Edit `client/.env.production` and replace the placeholder with your backend URL:
```
VITE_BACKEND_URL=https://your-backend-project.vercel.app
VITE_API_BASE_URL=https://your-backend-project.vercel.app
VITE_SOCKET_URL=https://your-backend-project.vercel.app
```

#### Step 2.2: Deploy on Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Choose the `client` folder as the root directory
5. Build Command should be: `npm run build`
6. Output Directory should be: `dist`
7. Click "Deploy"

### 3. Update Backend CORS Settings (Important!)

After deploying the frontend, you need to update the backend CORS configuration:

1. Go back to Vercel backend deployment settings
2. Add or update environment variable:
   - `FRONTEND_URL` - Your frontend URL (e.g., `https://your-frontend-project.vercel.app`)

3. Update `server/server.js` line 15 to:
```javascript
export const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  },
});
```

Also update `server/server.js` line 45 to:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
```

4. Push changes and redeploy:
```bash
git add .
git commit -m "Update CORS for production deployment"
git push
```

## Verification Checklist

- ✅ Backend server deployed and showing API status at `/api/status`
- ✅ Frontend client loading without errors
- ✅ Can register and login
- ✅ Can send messages in real-time
- ✅ Cloudinary image uploads working
- ✅ Real-time socket.io connection working

## Troubleshooting

### Issue: CORS errors
- Check that FRONTEND_URL environment variable is set correctly in backend
- Ensure Socket.IO cors configuration includes your frontend domain

### Issue: Images not uploading
- Verify Cloudinary credentials in environment variables
- Check Cloudinary quota and limits

### Issue: Database connection fails
- Verify MONGO_URI is correct
- Check MongoDB Atlas whitelist includes Vercel IP addresses
- Add `0.0.0.0/0` to MongoDB Atlas network access if testing

### Issue: Socket connection fails
- Ensure backend URL is correctly set in `.env.production`
- Check browser console for connection errors
- Verify CORS settings allow your frontend domain

## Performance Notes

- Socket.IO on Vercel serverless has limitations
- Consider using Vercel's native WebSocket support if available
- Monitor bandwidth usage due to WebSocket connections

## Next Steps

1. Monitor your deployments in Vercel dashboard
2. Set up analytics/monitoring
3. Consider setting up custom domains
4. Implement CI/CD for automatic deployments on git push

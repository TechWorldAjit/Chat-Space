# Vercel Deployment Checklist for Chat Space

## Pre-Deployment

- [x] Project structure verified (client and server folders)
- [x] Environment variables configured
- [x] Git repository initialized and pushed to GitHub
- [x] `.env.production` created for client
- [x] `.vercelignore` files created for both server and client
- [x] CORS configuration updated for production

## Backend Deployment (Server)

### Configuration Check
- [x] `server/vercel.json` configured correctly
- [x] `server/server.js` exports server for Vercel
- [x] Database connection handles errors gracefully
- [x] PORT uses environment variable (Vercel assigns dynamically)
- [x] Socket.IO configured with CORS

### Environment Variables to Set in Vercel
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Your secret key (use a strong random string)
- [ ] `CLOUDINARY_CLOUD_NAME` - From .env
- [ ] `CLOUDINARY_API_KEY` - From .env
- [ ] `CLOUDINARY_API_SECRET` - From .env
- [ ] `NODE_ENV` - Set to `production`
- [ ] `FRONTEND_URL` - Your frontend domain (after client deployment)

### Deployment Steps
1. [ ] Push code to GitHub
2. [ ] Go to vercel.com/dashboard
3. [ ] Click "Add New" → "Project"
4. [ ] Import GitHub repository
5. [ ] Set root directory to `server`
6. [ ] Set build command to `npm install` (if not auto-detected)
7. [ ] Add all environment variables listed above
8. [ ] Click Deploy
9. [ ] **Note the backend URL** (e.g., `https://chatspace-backend.vercel.app`)

## Frontend Deployment (Client)

### Configuration Check
- [x] `client/vercel.json` configured for SPA routing
- [x] `client/vite.config.js` properly configured
- [x] `client/.env.production` prepared with placeholder

### Update Before Deployment
- [ ] Replace `https://your-backend-domain.vercel.app` in `client/.env.production` with actual backend URL

### Deployment Steps
1. [ ] Update `client/.env.production` with backend URL
2. [ ] Commit changes: `git add . && git commit -m "Update backend URL for production" && git push`
3. [ ] Go to vercel.com/dashboard
4. [ ] Click "Add New" → "Project"
5. [ ] Import same GitHub repository (different project)
6. [ ] Set root directory to `client`
7. [ ] Build command: `npm run build`
8. [ ] Output directory: `dist`
9. [ ] Click Deploy
10. [ ] **Note the frontend URL**

## Post-Deployment Configuration

### Update Backend CORS
1. [ ] Go to backend Vercel project settings
2. [ ] Add/Update environment variable:
    - `FRONTEND_URL` = Your frontend URL from step 10 above
3. [ ] Redeploy backend for changes to take effect

### Testing
1. [ ] Visit frontend URL in browser
2. [ ] Check console for errors (F12)
3. [ ] Test user registration
4. [ ] Test user login
5. [ ] Test real-time messaging
6. [ ] Test image upload to Cloudinary
7. [ ] Verify online/offline status updates
8. [ ] Check Socket.IO connection in DevTools → Network → WS

## Troubleshooting Tips

### 404 Errors
- Ensure `client/vercel.json` has the correct rewrites configuration

### CORS Errors
- Check `FRONTEND_URL` is set in backend environment variables
- Ensure frontend and backend URLs are correct in both projects

### Socket Connection Issues
- Verify backend URL in `client/.env.production`
- Check Socket.IO connection logs in browser console
- Look for `io.on('connect')` events

### Database Connection Issues
- Test `MONGO_URI` locally first
- Ensure MongoDB Atlas has Vercel IP whitelisted
- Use connection string with `appName` parameter

### Image Upload Issues
- Verify Cloudinary credentials are correct
- Check Cloudinary account storage quota
- Test upload locally before deployment

## Files Modified for Deployment

1. `server/server.js` - Updated CORS configuration
2. `client/.env.production` - Created for production environment
3. `client/.vercelignore` - Created to exclude unnecessary files
4. `server/.vercelignore` - Created to exclude unnecessary files
5. `.env.example` - Created as environment variable template

## Important Notes

- **Never commit `.env` files to GitHub** - Use Vercel's environment variable panel
- **Socket.IO on Vercel serverless** - Works but may have latency on cold starts
- **MongoDB connection pooling** - Configured to handle multiple connections
- **Cloudinary limits** - Check your plan for storage/bandwidth limits
- **CORS must be configured** - Critical for frontend-backend communication

## Rollback Plan

If something goes wrong:
1. Vercel keeps previous deployments
2. Click "Production" tab in Vercel project
3. Select previous deployment and "Promote to Production"

## Performance Optimization

1. Monitor bundle size in Vercel Analytics
2. Consider image optimization for Cloudinary uploads
3. Watch for WebSocket connection errors
4. Monitor MongoDB connection pool usage

## Support Resources

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Socket.IO Vercel: https://socket.io/docs/v4/deployment/vercel/
- Cloudinary: https://cloudinary.com/documentation

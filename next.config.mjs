/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
    root: 'C:\\Users\\Omar\\OneDrive\\Desktop\\com\\my-app' 
  },
   images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
      port: "",
      pathname: "/**",
    },
    
  ],
  domains: ["lh3.googleusercontent.com"], 
},
 eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

 

export default nextConfig